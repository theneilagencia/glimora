import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('signal-collection') private signalQueue: Queue,
    private prisma: PrismaService,
  ) {}

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

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }
}
