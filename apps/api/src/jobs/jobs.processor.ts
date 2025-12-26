import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { SignalType, SignalStrength } from '@prisma/client';

@Processor('signal-collection')
export class SignalCollectionProcessor extends WorkerHost {
  private readonly logger = new Logger(SignalCollectionProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<{ organizationId: string; accountId?: string }>,
  ): Promise<void> {
    this.logger.log(
      `Processing job ${job.id} for organization ${job.data.organizationId}`,
    );

    const jobLog = await this.prisma.jobLog.create({
      data: {
        jobName: 'signal-collection',
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
            include: { decisors: true },
          })
        : await this.prisma.account.findMany({
            where: { organizationId: job.data.organizationId },
            include: { decisors: true },
          });

      for (const account of accounts) {
        await this.collectLinkedInSignals(account);
        await this.collectMediaSignals(account);

        for (const decisor of account.decisors) {
          await this.collectDecisorSignals(decisor);
        }
      }

      await this.prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      this.logger.log(`Job ${job.id} completed successfully`);
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

  private async collectLinkedInSignals(account: {
    id: string;
    name: string;
    linkedinUrl?: string | null;
  }) {
    if (!account.linkedinUrl) return;

    const mockSignals = [
      {
        type: SignalType.LINKEDIN_POST,
        strength: SignalStrength.MEDIUM,
        title: `${account.name} shared a new post about industry trends`,
        content:
          'Company shared insights about market developments and future strategies.',
        sourceUrl: account.linkedinUrl,
        score: 65,
        accountId: account.id,
      },
      {
        type: SignalType.LINKEDIN_ENGAGEMENT,
        strength: SignalStrength.LOW,
        title: `${account.name} engaged with industry content`,
        content: 'Company liked and commented on relevant industry posts.',
        sourceUrl: account.linkedinUrl,
        score: 45,
        accountId: account.id,
      },
    ];

    for (const signal of mockSignals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { lastSignalAt: new Date() },
    });
  }

  private async collectMediaSignals(account: { id: string; name: string }) {
    const mockMediaSignals = [
      {
        type: SignalType.MEDIA_MENTION,
        strength: SignalStrength.HIGH,
        title: `${account.name} mentioned in industry publication`,
        content:
          'Company was featured in a recent industry report discussing market leaders.',
        score: 75,
        accountId: account.id,
      },
    ];

    for (const signal of mockMediaSignals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }
  }

  private async collectDecisorSignals(decisor: {
    id: string;
    firstName: string;
    lastName: string;
    linkedinUrl?: string | null;
    accountId: string;
  }) {
    if (!decisor.linkedinUrl) return;

    const mockDecisorSignals = [
      {
        type: SignalType.LINKEDIN_POST,
        strength: SignalStrength.HIGH,
        title: `${decisor.firstName} ${decisor.lastName} published thought leadership content`,
        content:
          'Decision maker shared insights about industry challenges and solutions.',
        sourceUrl: decisor.linkedinUrl,
        score: 80,
        decisorId: decisor.id,
        accountId: decisor.accountId,
      },
      {
        type: SignalType.LINKEDIN_PROFILE_UPDATE,
        strength: SignalStrength.MEDIUM,
        title: `${decisor.firstName} ${decisor.lastName} updated their profile`,
        content: 'Decision maker made changes to their LinkedIn profile.',
        sourceUrl: decisor.linkedinUrl,
        score: 55,
        decisorId: decisor.id,
        accountId: decisor.accountId,
      },
    ];

    for (const signal of mockDecisorSignals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }

    await this.prisma.decisor.update({
      where: { id: decisor.id },
      data: { lastActivityAt: new Date() },
    });
  }
}
