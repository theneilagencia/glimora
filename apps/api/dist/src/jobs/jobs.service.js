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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
let JobsService = JobsService_1 = class JobsService {
    signalQueue;
    prisma;
    logger = new common_1.Logger(JobsService_1.name);
    constructor(signalQueue, prisma) {
        this.signalQueue = signalQueue;
        this.prisma = prisma;
    }
    async scheduleSignalCollection(organizationId, accountId) {
        const job = await this.signalQueue.add('collect-signals', { organizationId, accountId }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        this.logger.log(`Scheduled signal collection job ${job.id} for organization ${organizationId}`);
        return { jobId: job.id, status: 'scheduled' };
    }
    async scheduleWeeklyCollection(organizationId) {
        const job = await this.signalQueue.add('weekly-collection', { organizationId }, {
            repeat: {
                pattern: '0 0 * * 1',
            },
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        this.logger.log(`Scheduled weekly signal collection job ${job.id} for organization ${organizationId}`);
        return { jobId: job.id, status: 'scheduled', schedule: 'weekly' };
    }
    async getJobLogs(options) {
        const where = {};
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
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('signal-collection')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map