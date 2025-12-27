import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('signal-collection')
export class SignalCollectionProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(SignalCollectionProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async onModuleInit() {
    await this.cleanupMockSignals();
  }

  private async cleanupMockSignals() {
    const mockContentPatterns = [
      'Company shared insights about market developments and future strategies.',
      'Company liked and commented on relevant industry posts.',
      'Company was featured in a recent industry report discussing market leaders.',
      'Decision maker shared insights about industry challenges and solutions.',
      'Decision maker made changes to their LinkedIn profile.',
    ];

    try {
      const result = await this.prisma.signal.deleteMany({
        where: {
          content: { in: mockContentPatterns },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} mock signals on startup`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup mock signals: ${error}`);
    }
  }

  async process(
    job: Job<{ organizationId: string; accountId?: string }>,
  ): Promise<void> {
    this.logger.log(
      `Processing signal collection job ${job.id} for organization ${job.data.organizationId}`,
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
      // Signal collection is currently disabled - no mock data will be generated
      // Real signal collection requires integration with external APIs (LinkedIn, news sources, etc.)
      // This will be implemented in a future update
      this.logger.log(
        `Signal collection skipped for job ${job.id} - real integration not yet configured`,
      );

      await this.prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            organizationId: job.data.organizationId,
            accountId: job.data.accountId,
            skipped: true,
            reason: 'Real signal collection integration not yet configured',
          },
        },
      });

      this.logger.log(`Job ${job.id} completed (skipped - no real integration)`);
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
}
