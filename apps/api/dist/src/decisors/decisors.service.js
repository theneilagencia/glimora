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
exports.DecisorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DecisorsService = class DecisorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDecisorDto) {
        return this.prisma.decisor.create({
            data: createDecisorDto,
            include: {
                account: true,
            },
        });
    }
    async findAll(accountId) {
        return this.prisma.decisor.findMany({
            where: { accountId },
            include: {
                account: true,
                signals: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        signals: true,
                        actions: true,
                    },
                },
            },
            orderBy: { engagementScore: 'desc' },
        });
    }
    async findAllByOrganization(organizationId) {
        return this.prisma.decisor.findMany({
            where: {
                account: { organizationId },
            },
            include: {
                account: true,
                _count: {
                    select: {
                        signals: true,
                        actions: true,
                    },
                },
            },
            orderBy: { engagementScore: 'desc' },
        });
    }
    async findOne(id) {
        const decisor = await this.prisma.decisor.findUnique({
            where: { id },
            include: {
                account: true,
                signals: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                actions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!decisor) {
            throw new common_1.NotFoundException(`Decisor with ID ${id} not found`);
        }
        return decisor;
    }
    async update(id, updateDto) {
        return this.prisma.decisor.update({
            where: { id },
            data: updateDto,
            include: {
                account: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.decisor.delete({
            where: { id },
        });
    }
    async updateEngagementScore(id, score) {
        return this.prisma.decisor.update({
            where: { id },
            data: {
                engagementScore: score,
                lastActivityAt: new Date(),
            },
        });
    }
    async getTopDecisors(organizationId, limit = 10) {
        return this.prisma.decisor.findMany({
            where: {
                account: { organizationId },
            },
            orderBy: [{ engagementScore: 'desc' }, { influence: 'desc' }],
            take: limit,
            include: {
                account: true,
                _count: {
                    select: {
                        signals: true,
                    },
                },
            },
        });
    }
    async getDecisorsWithRecentActivity(organizationId, days = 7) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.prisma.decisor.findMany({
            where: {
                account: { organizationId },
                lastActivityAt: { gte: since },
            },
            orderBy: { lastActivityAt: 'desc' },
            include: {
                account: true,
                signals: {
                    where: { createdAt: { gte: since } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
};
exports.DecisorsService = DecisorsService;
exports.DecisorsService = DecisorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DecisorsService);
//# sourceMappingURL=decisors.service.js.map