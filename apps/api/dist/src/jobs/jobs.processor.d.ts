import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class SignalCollectionProcessor extends WorkerHost {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<{
        organizationId: string;
        accountId?: string;
    }>): Promise<void>;
    private collectLinkedInSignals;
    private collectMediaSignals;
    private collectDecisorSignals;
}
