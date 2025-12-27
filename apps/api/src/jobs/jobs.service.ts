import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('signal-collection') private signalQueue: Queue,
    @InjectQueue('decisor-detection') private decisorQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
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
