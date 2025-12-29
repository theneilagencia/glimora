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

      for (const account of accounts) {
        if (!account.linkedinUrl) {
          this.logger.log(`Skipping account ${account.name} - no LinkedIn URL`);
          continue;
        }

        const result = await this.detectDecisorsForAccount(account);
        totalDecisorsCreated += result.created;
        totalDecisorsUpdated += result.updated;
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
          },
        },
      });

      this.logger.log(
        `Job ${job.id} completed: ${totalDecisorsCreated} created, ${totalDecisorsUpdated} updated`,
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
  }): Promise<{ created: number; updated: number }> {
    if (!account.linkedinUrl) {
      return { created: 0, updated: 0 };
    }

    this.logger.log(`Detecting decisors for account: ${account.name}`);

    const employees = await this.apifyService.scrapeCompanyEmployees(
      account.linkedinUrl,
      50,
    );

    let created = 0;
    let updated = 0;

    for (const employee of employees) {
      const scoreInput =
        this.decisorScoreService.parseLinkedInEmployee(employee);
      const scoreResult = this.decisorScoreService.calculateScore(scoreInput);

      const existingDecisor = await this.prisma.decisor.findFirst({
        where: {
          accountId: account.id,
          linkedinUrl: employee.profileUrl,
        },
      });

      if (existingDecisor) {
        if (!existingDecisor.sellerFeedback) {
          // Update ALL fields including identity fields to fix any previously polluted data
          const nameParts = this.parseFullName(employee.fullName);
          await this.prisma.decisor.update({
            where: { id: existingDecisor.id },
            data: {
              firstName: nameParts.firstName || existingDecisor.firstName,
              lastName: nameParts.lastName || existingDecisor.lastName,
              title: employee.title || existingDecisor.title,
              avatarUrl: employee.avatarUrl || existingDecisor.avatarUrl,
              location: employee.location || existingDecisor.location,
              tenureMonths: scoreInput.tenureMonths,
              decisorScore: scoreResult.score,
              decisorLabel: scoreResult.label,
              profileComplete: scoreInput.profileComplete,
              scrapedAt: new Date(),
            },
          });
          updated++;
        }
      } else {
        const nameParts = this.parseFullName(employee.fullName);

        await this.prisma.decisor.create({
          data: {
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            title: employee.title,
            linkedinUrl: employee.profileUrl,
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

    this.logger.log(
      `Account ${account.name}: ${created} decisors created, ${updated} updated`,
    );

    return { created, updated };
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
