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
exports.ActionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ActionsService = class ActionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createActionDto) {
        return this.prisma.action.create({
            data: {
                ...createActionDto,
                dueDate: createActionDto.dueDate
                    ? new Date(createActionDto.dueDate)
                    : undefined,
            },
            include: {
                account: true,
                decisor: true,
                signal: true,
                assignedTo: true,
                authorityContent: true,
            },
        });
    }
    async findAll(organizationId, options) {
        const where = {
            account: { organizationId },
        };
        if (options?.status) {
            where.status = options.status;
        }
        if (options?.assignedToId) {
            where.assignedToId = options.assignedToId;
        }
        return this.prisma.action.findMany({
            where,
            include: {
                account: true,
                decisor: true,
                signal: true,
                assignedTo: true,
                authorityContent: true,
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            take: options?.limit,
        });
    }
    async findOne(id) {
        const action = await this.prisma.action.findUnique({
            where: { id },
            include: {
                account: true,
                decisor: true,
                signal: true,
                assignedTo: true,
                authorityContent: true,
            },
        });
        if (!action) {
            throw new common_1.NotFoundException(`Action with ID ${id} not found`);
        }
        return action;
    }
    async update(id, updateDto) {
        return this.prisma.action.update({
            where: { id },
            data: {
                ...updateDto,
                dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
            },
            include: {
                account: true,
                decisor: true,
                signal: true,
                assignedTo: true,
                authorityContent: true,
            },
        });
    }
    async updateStatus(id, status) {
        const data = { status };
        if (status === client_1.ActionStatus.COMPLETED) {
            data.completedAt = new Date();
        }
        return this.prisma.action.update({
            where: { id },
            data,
            include: {
                account: true,
                decisor: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.action.delete({
            where: { id },
        });
    }
    async getPendingActions(userId) {
        return this.prisma.action.findMany({
            where: {
                assignedToId: userId,
                status: client_1.ActionStatus.PENDING,
            },
            include: {
                account: true,
                decisor: true,
                signal: true,
                authorityContent: true,
            },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        });
    }
    async generateActionsFromSignal(signalId) {
        const signal = await this.prisma.signal.findUnique({
            where: { id: signalId },
            include: {
                account: true,
                decisor: true,
            },
        });
        if (!signal) {
            throw new common_1.NotFoundException(`Signal with ID ${signalId} not found`);
        }
        const actions = [];
        if (signal.type === client_1.SignalType.LINKEDIN_POST ||
            signal.type === client_1.SignalType.LINKEDIN_ENGAGEMENT) {
            actions.push({
                type: client_1.ActionType.OUTREACH,
                title: `Engage with ${signal.decisor?.firstName || 'contact'}'s LinkedIn activity`,
                description: `${signal.title}`,
                suggestedMessage: this.generateOutreachMessage(signal),
                priority: signal.strength === client_1.SignalStrength.HIGH ||
                    signal.strength === client_1.SignalStrength.CRITICAL
                    ? 80
                    : 50,
                accountId: signal.accountId || undefined,
                decisorId: signal.decisorId || undefined,
                signalId: signal.id,
                checklist: [
                    { item: 'Review the LinkedIn post/activity', completed: false },
                    { item: 'Like and comment on the post', completed: false },
                    { item: 'Send personalized connection message', completed: false },
                ],
            });
        }
        if (signal.type === client_1.SignalType.MEDIA_MENTION ||
            signal.type === client_1.SignalType.PRESS_OPPORTUNITY) {
            actions.push({
                type: client_1.ActionType.CONTENT_SHARE,
                title: `Share relevant content with ${signal.account?.name || 'account'}`,
                description: `Media mention detected: ${signal.title}`,
                suggestedMessage: this.generateContentShareMessage(signal),
                priority: 70,
                accountId: signal.accountId || undefined,
                decisorId: signal.decisorId || undefined,
                signalId: signal.id,
                checklist: [
                    { item: 'Review the media mention', completed: false },
                    { item: 'Prepare relevant authority content', completed: false },
                    { item: 'Share with appropriate contacts', completed: false },
                ],
            });
        }
        if (signal.strength === client_1.SignalStrength.CRITICAL) {
            actions.push({
                type: client_1.ActionType.MEETING_REQUEST,
                title: `Schedule meeting with ${signal.decisor?.firstName || signal.account?.name || 'contact'}`,
                description: `High-priority signal detected: ${signal.title}`,
                suggestedMessage: this.generateMeetingRequestMessage(signal),
                priority: 90,
                accountId: signal.accountId || undefined,
                decisorId: signal.decisorId || undefined,
                signalId: signal.id,
                checklist: [
                    { item: 'Prepare meeting agenda', completed: false },
                    { item: 'Send calendar invite', completed: false },
                    { item: 'Prepare relevant materials', completed: false },
                ],
            });
        }
        const createdActions = await Promise.all(actions.map((action) => this.create(action)));
        return createdActions;
    }
    generateOutreachMessage(signal) {
        const name = signal.decisor?.firstName || 'there';
        return `Hi ${name},\n\nI noticed your recent activity on LinkedIn regarding "${signal.title}". I found it very insightful and would love to connect and discuss further.\n\nBest regards`;
    }
    generateContentShareMessage(signal) {
        return `I came across this recent news about ${signal.account?.name || 'your company'} - "${signal.title}". I thought you might find our perspective on this topic valuable. Would you be interested in a brief conversation?`;
    }
    generateMeetingRequestMessage(signal) {
        const name = signal.decisor?.firstName || 'there';
        return `Hi ${name},\n\nGiven the recent developments regarding "${signal.title}", I believe there's a timely opportunity for us to connect. Would you have 15-20 minutes this week for a brief call?\n\nBest regards`;
    }
    async getActionStats(organizationId) {
        const [total, byStatus, byType, completed] = await Promise.all([
            this.prisma.action.count({
                where: { account: { organizationId } },
            }),
            this.prisma.action.groupBy({
                by: ['status'],
                where: { account: { organizationId } },
                _count: true,
            }),
            this.prisma.action.groupBy({
                by: ['type'],
                where: { account: { organizationId } },
                _count: true,
            }),
            this.prisma.action.count({
                where: {
                    account: { organizationId },
                    status: client_1.ActionStatus.COMPLETED,
                    completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);
        return {
            total,
            byStatus,
            byType,
            completedThisWeek: completed,
        };
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActionsService);
//# sourceMappingURL=actions.service.js.map