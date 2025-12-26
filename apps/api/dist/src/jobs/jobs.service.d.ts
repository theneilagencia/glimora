import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class JobsService {
    private signalQueue;
    private prisma;
    private readonly logger;
    constructor(signalQueue: Queue, prisma: PrismaService);
    scheduleSignalCollection(organizationId: string, accountId?: string): Promise<{
        jobId: string | undefined;
        status: string;
    }>;
    scheduleWeeklyCollection(organizationId: string): Promise<{
        jobId: string | undefined;
        status: string;
        schedule: string;
    }>;
    getJobLogs(options?: {
        jobName?: string;
        status?: string;
        limit?: number;
    }): Promise<{
        error: string | null;
        id: string;
        status: string;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        jobName: string;
        startedAt: Date;
    }[]>;
    getJobStats(): Promise<{
        total: number;
        byStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.JobLogGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        recentWeek: number;
    }>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }>;
}
