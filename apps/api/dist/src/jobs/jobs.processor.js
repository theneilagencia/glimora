"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SignalCollectionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalCollectionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SignalCollectionProcessor = SignalCollectionProcessor_1 = class SignalCollectionProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(SignalCollectionProcessor_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        this.logger.log(`Processing job ${job.id} for organization ${job.data.organizationId}`);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
    async collectLinkedInSignals(account) {
        if (!account.linkedinUrl)
            return;
        const mockSignals = [
            {
                type: client_1.SignalType.LINKEDIN_POST,
                strength: client_1.SignalStrength.MEDIUM,
                title: `${account.name} shared a new post about industry trends`,
                content: 'Company shared insights about market developments and future strategies.',
                sourceUrl: account.linkedinUrl,
                score: 65,
                accountId: account.id,
            },
            {
                type: client_1.SignalType.LINKEDIN_ENGAGEMENT,
                strength: client_1.SignalStrength.LOW,
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
    async collectMediaSignals(account) {
        const mockMediaSignals = [
            {
                type: client_1.SignalType.MEDIA_MENTION,
                strength: client_1.SignalStrength.HIGH,
                title: `${account.name} mentioned in industry publication`,
                content: 'Company was featured in a recent industry report discussing market leaders.',
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
    async collectDecisorSignals(decisor) {
        if (!decisor.linkedinUrl)
            return;
        const mockDecisorSignals = [
            {
                type: client_1.SignalType.LINKEDIN_POST,
                strength: client_1.SignalStrength.HIGH,
                title: `${decisor.firstName} ${decisor.lastName} published thought leadership content`,
                content: 'Decision maker shared insights about industry challenges and solutions.',
                sourceUrl: decisor.linkedinUrl,
                score: 80,
                decisorId: decisor.id,
                accountId: decisor.accountId,
            },
            {
                type: client_1.SignalType.LINKEDIN_PROFILE_UPDATE,
                strength: client_1.SignalStrength.MEDIUM,
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
};
exports.SignalCollectionProcessor = SignalCollectionProcessor;
exports.SignalCollectionProcessor = SignalCollectionProcessor = SignalCollectionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('signal-collection'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SignalCollectionProcessor);
//# sourceMappingURL=jobs.processor.js.map