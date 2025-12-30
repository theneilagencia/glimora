import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ApifyService } from '../apify/apify.service';
import { DecisorScoreService } from '../decisors/decisor-score.service';

interface DecisorDetectionJobData {
  organizationId: string;
  accountId?: string;
}

@Processor('decisor-detection')
export class DecisorDetectionProcessor extends WorkerHost {
  private readonly logger = new Logger(DecisorDetectionProcessor.name);

  constructor(
    private prisma: PrismaService,
    private apifyService: ApifyService,
    private decisorScoreService: DecisorScoreService,
  ) {
    super();
  }

  async process(job: Job<DecisorDetectionJobData>): Promise<void> {
    this.logger.log(
      `Processing decisor detection job ${job.id} for organization ${job.data.organizationId}`,
    );

    const jobLog = await this.prisma.jobLog.create({
      data: {
        jobName: 'decisor-detection',
        status: 'running',
        metadata: {
          organizationId: job.data.organizationId,
          accountId: job.data.accountId,
        },
      },
    });

    try {
      const accounts = job.data.accountId
        ? await this.prisma.account.findMany({
            where: { id: job.data.accountId },
          })
        : await this.prisma.account.findMany({
            where: { organizationId: job.data.organizationId },
          });

      let totalDecisorsCreated = 0;
      let totalDecisorsUpdated = 0;
      let totalDecisorsDeleted = 0;

      for (const account of accounts) {
        if (!account.linkedinUrl) {
          this.logger.log(`Skipping account ${account.name} - no LinkedIn URL`);
          continue;
        }

        const result = await this.detectDecisorsForAccount(account);
        totalDecisorsCreated += result.created;
        totalDecisorsUpdated += result.updated;
        totalDecisorsDeleted += result.deleted;
      }

      await this.prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            organizationId: job.data.organizationId,
            accountId: job.data.accountId,
            totalDecisorsCreated,
            totalDecisorsUpdated,
            totalDecisorsDeleted,
          },
        },
      });

      this.logger.log(
        `Job ${job.id} completed: ${totalDecisorsCreated} created, ${totalDecisorsUpdated} updated, ${totalDecisorsDeleted} deleted`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errorMessage,
        },
      });

      this.logger.error(`Job ${job.id} failed: ${errorMessage}`);
      throw error;
    }
  }

  private async detectDecisorsForAccount(account: {
    id: string;
    name: string;
    linkedinUrl: string | null;
  }): Promise<{ created: number; updated: number; deleted: number }> {
    if (!account.linkedinUrl) {
      return { created: 0, updated: 0, deleted: 0 };
    }

    this.logger.log(`Detecting decisors for account: ${account.name}`);

    const employees = await this.apifyService.scrapeCompanyEmployees(
      account.linkedinUrl,
      50,
    );

    // Skip items without valid LinkedIn profile URL
    // Be lenient with URL format - accept with or without protocol
    const validEmployees = employees.filter((e) => {
      if (!e.profileUrl) return false;
      const url = e.profileUrl.toLowerCase();
      return url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/');
    });

    this.logger.log(
      `Found ${validEmployees.length} valid employees out of ${employees.length} total`,
    );

    let created = 0;
    let updated = 0;

    // Track all valid LinkedIn URLs from this scrape
    const scrapedLinkedInUrls = new Set<string>();

    for (const employee of validEmployees) {
      if (employee.profileUrl) {
        scrapedLinkedInUrls.add(this.normalizeLinkedInUrl(employee.profileUrl));
      }

      const scoreInput =
        this.decisorScoreService.parseLinkedInEmployee(employee);
      const scoreResult = this.decisorScoreService.calculateScore(scoreInput);

      const normalizedUrl = employee.profileUrl
        ? this.normalizeLinkedInUrl(employee.profileUrl)
        : null;

      const existingDecisor = await this.prisma.decisor.findFirst({
        where: {
          accountId: account.id,
          linkedinUrl: normalizedUrl,
        },
      });

      const nameParts = this.parseFullName(employee.fullName);

      if (existingDecisor) {
        // Always update identity fields (title, avatar, location) even if feedback exists
        // Only skip updating score/label if feedback exists
        await this.prisma.decisor.update({
          where: { id: existingDecisor.id },
          data: {
            firstName: nameParts.firstName || existingDecisor.firstName,
            lastName: nameParts.lastName || existingDecisor.lastName,
            title: employee.title || existingDecisor.title,
            avatarUrl: employee.avatarUrl || existingDecisor.avatarUrl,
            location: employee.location || existingDecisor.location,
            tenureMonths: scoreInput.tenureMonths,
            // Only update score/label if no seller feedback
            ...(existingDecisor.sellerFeedback
              ? {}
              : {
                  decisorScore: scoreResult.score,
                  decisorLabel: scoreResult.label,
                }),
            profileComplete: scoreInput.profileComplete,
            scrapedAt: new Date(),
          },
        });
        updated++;
      } else {
        await this.prisma.decisor.create({
          data: {
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            title: employee.title,
            linkedinUrl: normalizedUrl,
            avatarUrl: employee.avatarUrl,
            location: employee.location,
            tenureMonths: scoreInput.tenureMonths,
            decisorScore: scoreResult.score,
            decisorLabel: scoreResult.label,
            profileComplete: scoreInput.profileComplete || false,
            scrapedAt: new Date(),
            accountId: account.id,
          },
        });
        created++;
      }
    }

    // Delete stale decisors that are NOT in the latest Apify results
    // Only delete those without seller feedback to preserve curated data
    // GUARD: Only delete if we got valid employees from Apify (avoid deleting all on API error)
    let deleted = 0;
    
    if (scrapedLinkedInUrls.size > 0) {
      // Delete decisors with linkedinUrl NOT in the scraped set
      const staleDecisors = await this.prisma.decisor.findMany({
        where: {
          accountId: account.id,
          sellerFeedback: null,
          linkedinUrl: {
            notIn: Array.from(scrapedLinkedInUrls),
          },
        },
      });

      if (staleDecisors.length > 0) {
        this.logger.log(
          `Deleting ${staleDecisors.length} stale decisors for account ${account.name}`,
        );
        await this.prisma.decisor.deleteMany({
          where: {
            id: { in: staleDecisors.map((d) => d.id) },
          },
        });
        deleted = staleDecisors.length;
      }
    } else {
      this.logger.warn(
        `No valid employees found from Apify for account ${account.name} - skipping deletion to avoid data loss`,
      );
    }
    
    // Also clean up decisors with null/invalid linkedinUrl (these are stale from old scrapes)
    const invalidDecisors = await this.prisma.decisor.findMany({
      where: {
        accountId: account.id,
        sellerFeedback: null,
        OR: [
          { linkedinUrl: null },
          { linkedinUrl: '' },
        ],
      },
    });
    
    if (invalidDecisors.length > 0) {
      this.logger.log(
        `Deleting ${invalidDecisors.length} decisors with invalid LinkedIn URLs for account ${account.name}`,
      );
      await this.prisma.decisor.deleteMany({
        where: {
          id: { in: invalidDecisors.map((d) => d.id) },
        },
      });
      deleted += invalidDecisors.length;
    }

    this.logger.log(
      `Account ${account.name}: ${created} created, ${updated} updated, ${deleted} deleted`,
    );

    return { created, updated, deleted };
  }

  private normalizeLinkedInUrl(url: string): string {
    // Normalize LinkedIn URL: remove query params, trailing slashes, ensure https
    try {
      // Add https:// if no protocol is present
      let urlToParse = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToParse = `https://${url}`;
      }
      const parsed = new URL(urlToParse);
      // Remove query params and hash
      let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
      // Remove trailing slash
      normalized = normalized.replace(/\/$/, '');
      // Ensure https
      normalized = normalized.replace(/^http:/, 'https:');
      return normalized;
    } catch {
      // If URL parsing fails, return a basic normalized version
      let normalized = url.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/$/, '');
      if (!normalized.startsWith('https://')) {
        normalized = normalized.replace(/^http:\/\//, 'https://');
        if (!normalized.startsWith('https://')) {
          normalized = `https://${normalized}`;
        }
      }
      return normalized;
    }
  }

  private parseFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0) {
      return { firstName: 'Unknown', lastName: '' };
    }

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }
}
