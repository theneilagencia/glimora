import { JobsService } from './jobs.service';
import type { User } from '@prisma/client';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    scheduleSignalCollection(user: User, accountId?: string): Promise<{
        jobId: string | undefined;
        status: string;
    }>;
    scheduleWeeklyCollection(user: User): Promise<{
        jobId: string | undefined;
        status: string;
        schedule: string;
    }>;
    getJobLogs(jobName?: string, status?: string, limit?: string): Promise<{
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
