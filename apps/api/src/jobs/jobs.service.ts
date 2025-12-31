import { Injectable, Logger, OnModuleInit, Optional, Inject } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

// Check if BullMQ workers are disabled
const DISABLE_BULLMQ_WORKERS = process.env.DISABLE_BULLMQ_WORKERS === 'true';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @Optional() @Inject(getQueueToken('signal-collection')) private signalQueue: Queue | null,
    @Optional() @Inject(getQueueToken('decisor-detection')) private decisorQueue: Queue | null,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // Skip weekly jobs initialization if BullMQ is disabled
    if (DISABLE_BULLMQ_WORKERS || !this.signalQueue || !this.decisorQueue) {
      this.logger.log('BullMQ workers disabled - skipping weekly jobs initialization');
      return;
    }
    // Schedule weekly jobs for all organizations on startup
    await this.initializeWeeklyJobs();
  }

  private async initializeWeeklyJobs() {
    try {
      // Get all organizations
      const organizations = await this.prisma.organization.findMany({
        select: { id: true, name: true },
      });

      this.logger.log(
        `Initializing weekly jobs for ${organizations.length} organizations`,
      );

      for (const org of organizations) {
        await this.ensureWeeklyDecisorDetectionJob(org.id);
        await this.ensureWeeklySignalCollectionJob(org.id);
      }

      this.logger.log('Weekly jobs initialization completed');
    } catch (error) {
      this.logger.warn(
        `Failed to initialize weekly jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - app should still start even if Redis is down
    }
  }

  private async ensureWeeklyDecisorDetectionJob(organizationId: string) {
    if (!this.decisorQueue) return;
    try {
      const jobId = `weekly-decisor-detection:${organizationId}`;
      const existingJobs = await this.decisorQueue.getRepeatableJobs();
      const exists = existingJobs.some((job) => job.id === jobId);

      if (!exists) {
        await this.decisorQueue.add(
          'weekly-decisor-detection',
          { organizationId },
          {
            repeat: {
              pattern: '0 0 * * 1', // Every Monday at midnight
            },
            jobId,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        );
        this.logger.log(
          `Created weekly decisor detection job for organization ${organizationId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to create weekly decisor detection job for ${organizationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async ensureWeeklySignalCollectionJob(organizationId: string) {
    if (!this.signalQueue) return;
    try {
      const jobId = `weekly-signal-collection:${organizationId}`;
      const existingJobs = await this.signalQueue.getRepeatableJobs();
      const exists = existingJobs.some((job) => job.id === jobId);

      if (!exists) {
        await this.signalQueue.add(
          'weekly-collection',
          { organizationId },
          {
            repeat: {
              pattern: '0 0 * * 1', // Every Monday at midnight
            },
            jobId,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        );
        this.logger.log(
          `Created weekly signal collection job for organization ${organizationId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to create weekly signal collection job for ${organizationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async scheduleSignalCollection(organizationId: string, accountId?: string) {
    if (!this.signalQueue) {
      this.logger.warn('BullMQ disabled - cannot schedule signal collection');
      return { jobId: null, status: 'disabled', message: 'Job queue is disabled' };
    }
    const job = await this.signalQueue.add(
      'collect-signals',
      { organizationId, accountId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(
      `Scheduled signal collection job ${job.id} for organization ${organizationId}`,
    );
    return { jobId: job.id, status: 'scheduled' };
  }

  async scheduleWeeklyCollection(organizationId: string) {
    if (!this.signalQueue) {
      this.logger.warn('BullMQ disabled - cannot schedule weekly collection');
      return { jobId: null, status: 'disabled', message: 'Job queue is disabled' };
    }
    const job = await this.signalQueue.add(
      'weekly-collection',
      { organizationId },
      {
        repeat: {
          pattern: '0 0 * * 1',
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(
      `Scheduled weekly signal collection job ${job.id} for organization ${organizationId}`,
    );
    return { jobId: job.id, status: 'scheduled', schedule: 'weekly' };
  }

  async getJobLogs(options?: {
    jobName?: string;
    status?: string;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (options?.jobName) {
      where.jobName = options.jobName;
    }

    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.jobLog.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: options?.limit || 50,
    });
  }

  async getJobStats() {
    const [total, byStatus, recent] = await Promise.all([
      this.prisma.jobLog.count(),
      this.prisma.jobLog.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.jobLog.count({
        where: {
          startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      byStatus,
      recentWeek: recent,
    };
  }

  async getQueueStatus() {
    if (!this.signalQueue || !this.decisorQueue) {
      return {
        signalCollection: { waiting: 0, active: 0, completed: 0, failed: 0, disabled: true },
        decisorDetection: { waiting: 0, active: 0, completed: 0, failed: 0, disabled: true },
      };
    }
    const [waiting, active, completed, failed] = await Promise.all([
      this.signalQueue.getWaitingCount(),
      this.signalQueue.getActiveCount(),
      this.signalQueue.getCompletedCount(),
      this.signalQueue.getFailedCount(),
    ]);

    const [decisorWaiting, decisorActive, decisorCompleted, decisorFailed] =
      await Promise.all([
        this.decisorQueue.getWaitingCount(),
        this.decisorQueue.getActiveCount(),
        this.decisorQueue.getCompletedCount(),
        this.decisorQueue.getFailedCount(),
      ]);

    return {
      signalCollection: {
        waiting,
        active,
        completed,
        failed,
      },
      decisorDetection: {
        waiting: decisorWaiting,
        active: decisorActive,
        completed: decisorCompleted,
        failed: decisorFailed,
      },
    };
  }

  async scheduleDecisorDetection(organizationId: string, accountId?: string) {
    if (!this.decisorQueue) {
      this.logger.warn('BullMQ disabled - cannot schedule decisor detection');
      return { jobId: null, status: 'disabled', message: 'Job queue is disabled. Use /decisors/sync endpoint instead.' };
    }
    const job = await this.decisorQueue.add(
      'detect-decisors',
      { organizationId, accountId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(
      `Scheduled decisor detection job ${job.id} for organization ${organizationId}`,
    );
    return { jobId: job.id, status: 'scheduled' };
  }

  async scheduleWeeklyDecisorDetection(organizationId: string) {
    if (!this.decisorQueue) {
      this.logger.warn('BullMQ disabled - cannot schedule weekly decisor detection');
      return { jobId: null, status: 'disabled', message: 'Job queue is disabled' };
    }
    const job = await this.decisorQueue.add(
      'weekly-decisor-detection',
      { organizationId },
      {
        repeat: {
          pattern: '0 0 * * 1',
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(
      `Scheduled weekly decisor detection job ${job.id} for organization ${organizationId}`,
    );
    return { jobId: job.id, status: 'scheduled', schedule: 'weekly' };
  }
}
