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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, createAccountDto) {
        return this.prisma.account.create({
            data: {
                ...createAccountDto,
                organizationId,
            },
            include: {
                assignedTo: true,
                decisors: true,
            },
        });
    }
    async findAll(organizationId, options) {
        return this.prisma.account.findMany({
            where: { organizationId },
            include: {
                assignedTo: true,
                decisors: true,
                signals: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        signals: true,
                        actions: true,
                        decisors: true,
                    },
                },
            },
            orderBy: options?.sortBy === 'priority'
                ? { priority: 'desc' }
                : { signalScore: 'desc' },
            take: options?.limit,
        });
    }
    async findOne(id) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            include: {
                assignedTo: true,
                decisors: true,
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
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        return account;
    }
    async update(id, updateDto) {
        return this.prisma.account.update({
            where: { id },
            data: updateDto,
            include: {
                assignedTo: true,
                decisors: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.account.delete({
            where: { id },
        });
    }
    async assignTo(id, userId) {
        return this.prisma.account.update({
            where: { id },
            data: { assignedToId: userId },
            include: {
                assignedTo: true,
            },
        });
    }
    async updateSignalScore(id, score) {
        return this.prisma.account.update({
            where: { id },
            data: {
                signalScore: score,
                lastSignalAt: new Date(),
            },
        });
    }
    async getTopAccounts(organizationId, limit = 10) {
        return this.prisma.account.findMany({
            where: { organizationId },
            orderBy: { signalScore: 'desc' },
            take: limit,
            include: {
                assignedTo: true,
                _count: {
                    select: {
                        signals: true,
                        actions: true,
                    },
                },
            },
        });
    }
    async getAccountsWithRecentSignals(organizationId, days = 7) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.prisma.account.findMany({
            where: {
                organizationId,
                lastSignalAt: { gte: since },
            },
            orderBy: { lastSignalAt: 'desc' },
            include: {
                signals: {
                    where: { createdAt: { gte: since } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map