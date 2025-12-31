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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SignalsService = class SignalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSignalDto) {
        const { metadata, accountId, decisorId, ...rest } = createSignalDto;
        const signal = await this.prisma.signal.create({
            data: {
                ...rest,
                processedAt: new Date(),
                metadata: metadata,
                ...(accountId && { account: { connect: { id: accountId } } }),
                ...(decisorId && { decisor: { connect: { id: decisorId } } }),
            },
            include: {
                account: true,
                decisor: true,
            },
        });
        if (signal.accountId) {
            await this.updateAccountScore(signal.accountId);
        }
        if (signal.decisorId) {
            await this.updateDecisorScore(signal.decisorId);
        }
        return signal;
    }
    async findAll(organizationId, options) {
        const where = {
            account: { organizationId },
        };
        if (options?.type) {
            where.type = options.type;
        }
        if (options?.days) {
            const since = new Date(Date.now() - options.days * 24 * 60 * 60 * 1000);
            where.createdAt = { gte: since };
        }
        return this.prisma.signal.findMany({
            where,
            include: {
                account: true,
                decisor: true,
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit,
        });
    }
    async findOne(id) {
        const signal = await this.prisma.signal.findUnique({
            where: { id },
            include: {
                account: true,
                decisor: true,
                actions: true,
            },
        });
        if (!signal) {
            throw new common_1.NotFoundException(`Signal with ID ${id} not found`);
        }
        return signal;
    }
    async findByAccount(accountId) {
        return this.prisma.signal.findMany({
            where: { accountId },
            include: {
                decisor: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByDecisor(decisorId) {
        return this.prisma.signal.findMany({
            where: { decisorId },
            include: {
                account: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id) {
        return this.prisma.signal.delete({
            where: { id },
        });
    }
    calculateScore(signal) {
        let score = 50;
        const strengthScores = {
            LOW: 10,
            MEDIUM: 25,
            HIGH: 40,
            CRITICAL: 50,
        };
        if (signal.strength) {
            score += strengthScores[signal.strength];
        }
        const typeScores = {
            LINKEDIN_POST: 15,
            LINKEDIN_ENGAGEMENT: 20,
            LINKEDIN_PROFILE_UPDATE: 10,
            MEDIA_MENTION: 25,
            PRESS_OPPORTUNITY: 30,
            INDUSTRY_NEWS: 15,
        };
        score += typeScores[signal.type];
        return Math.min(100, Math.max(0, score));
    }
    async updateAccountScore(accountId) {
        const signals = await this.prisma.signal.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
        const avgScore = signals.length > 0 ? Math.round(totalScore / signals.length) : 0;
        await this.prisma.account.update({
            where: { id: accountId },
            data: {
                signalScore: avgScore,
                lastSignalAt: new Date(),
            },
        });
    }
    async updateDecisorScore(decisorId) {
        const signals = await this.prisma.signal.findMany({
            where: { decisorId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
        const avgScore = signals.length > 0 ? Math.round(totalScore / signals.length) : 0;
        await this.prisma.decisor.update({
            where: { id: decisorId },
            data: {
                engagementScore: avgScore,
                lastActivityAt: new Date(),
            },
        });
    }
    async getSignalStats(organizationId) {
        const [total, byType, byStrength, recent] = await Promise.all([
            this.prisma.signal.count({
                where: { account: { organizationId } },
            }),
            this.prisma.signal.groupBy({
                by: ['type'],
                where: { account: { organizationId } },
                _count: true,
            }),
            this.prisma.signal.groupBy({
                by: ['strength'],
                where: { account: { organizationId } },
                _count: true,
            }),
            this.prisma.signal.count({
                where: {
                    account: { organizationId },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);
        return {
            total,
            byType,
            byStrength,
            recentWeek: recent,
        };
    }
};
exports.SignalsService = SignalsService;
exports.SignalsService = SignalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SignalsService);
//# sourceMappingURL=signals.service.js.map