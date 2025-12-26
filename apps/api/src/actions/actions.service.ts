import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionDto } from './dto/create-action.dto';
import {
  ActionStatus,
  ActionType,
  SignalType,
  SignalStrength,
} from '@prisma/client';

@Injectable()
export class ActionsService {
  constructor(private prisma: PrismaService) {}

  async create(createActionDto: CreateActionDto) {
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

  async findAll(
    organizationId: string,
    options?: { status?: ActionStatus; assignedToId?: string; limit?: number },
  ) {
    const where: Record<string, unknown> = {
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Action with ID ${id} not found`);
    }

    return action;
  }

  async update(id: string, updateDto: Partial<CreateActionDto>) {
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

  async updateStatus(id: string, status: ActionStatus) {
    const data: Record<string, unknown> = { status };

    if (status === ActionStatus.COMPLETED) {
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

  async remove(id: string) {
    return this.prisma.action.delete({
      where: { id },
    });
  }

  async getPendingActions(userId: string) {
    return this.prisma.action.findMany({
      where: {
        assignedToId: userId,
        status: ActionStatus.PENDING,
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

  async generateActionsFromSignal(signalId: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
      include: {
        account: true,
        decisor: true,
      },
    });

    if (!signal) {
      throw new NotFoundException(`Signal with ID ${signalId} not found`);
    }

    const actions: CreateActionDto[] = [];

    if (
      signal.type === SignalType.LINKEDIN_POST ||
      signal.type === SignalType.LINKEDIN_ENGAGEMENT
    ) {
      actions.push({
        type: ActionType.OUTREACH,
        title: `Engage with ${signal.decisor?.firstName || 'contact'}'s LinkedIn activity`,
        description: `${signal.title}`,
        suggestedMessage: this.generateOutreachMessage(signal),
        priority:
          signal.strength === SignalStrength.HIGH ||
          signal.strength === SignalStrength.CRITICAL
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

    if (
      signal.type === SignalType.MEDIA_MENTION ||
      signal.type === SignalType.PRESS_OPPORTUNITY
    ) {
      actions.push({
        type: ActionType.CONTENT_SHARE,
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

    if (signal.strength === SignalStrength.CRITICAL) {
      actions.push({
        type: ActionType.MEETING_REQUEST,
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

    const createdActions = await Promise.all(
      actions.map((action) => this.create(action)),
    );

    return createdActions;
  }

  private generateOutreachMessage(signal: {
    title: string;
    decisor?: { firstName: string } | null;
  }): string {
    const name = signal.decisor?.firstName || 'there';
    return `Hi ${name},\n\nI noticed your recent activity on LinkedIn regarding "${signal.title}". I found it very insightful and would love to connect and discuss further.\n\nBest regards`;
  }

  private generateContentShareMessage(signal: {
    title: string;
    account?: { name: string } | null;
  }): string {
    return `I came across this recent news about ${signal.account?.name || 'your company'} - "${signal.title}". I thought you might find our perspective on this topic valuable. Would you be interested in a brief conversation?`;
  }

  private generateMeetingRequestMessage(signal: {
    title: string;
    decisor?: { firstName: string } | null;
  }): string {
    const name = signal.decisor?.firstName || 'there';
    return `Hi ${name},\n\nGiven the recent developments regarding "${signal.title}", I believe there's a timely opportunity for us to connect. Would you have 15-20 minutes this week for a brief call?\n\nBest regards`;
  }

  async getActionStats(organizationId: string) {
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
          status: ActionStatus.COMPLETED,
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
}
