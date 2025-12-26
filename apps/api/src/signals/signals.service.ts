import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { SignalType, SignalStrength, Prisma } from '@prisma/client';

@Injectable()
export class SignalsService {
  constructor(private prisma: PrismaService) {}

  async create(createSignalDto: CreateSignalDto) {
    const { metadata, accountId, decisorId, ...rest } = createSignalDto;
    const signal = await this.prisma.signal.create({
      data: {
        ...rest,
        processedAt: new Date(),
        metadata: metadata as Prisma.InputJsonValue,
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

  async findAll(
    organizationId: string,
    options?: { type?: SignalType; limit?: number; days?: number },
  ) {
    const where: Record<string, unknown> = {
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

  async findOne(id: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id },
      include: {
        account: true,
        decisor: true,
        actions: true,
      },
    });

    if (!signal) {
      throw new NotFoundException(`Signal with ID ${id} not found`);
    }

    return signal;
  }

  async findByAccount(accountId: string) {
    return this.prisma.signal.findMany({
      where: { accountId },
      include: {
        decisor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDecisor(decisorId: string) {
    return this.prisma.signal.findMany({
      where: { decisorId },
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.signal.delete({
      where: { id },
    });
  }

  calculateScore(signal: CreateSignalDto): number {
    let score = 50;

    const strengthScores: Record<SignalStrength, number> = {
      LOW: 10,
      MEDIUM: 25,
      HIGH: 40,
      CRITICAL: 50,
    };

    if (signal.strength) {
      score += strengthScores[signal.strength];
    }

    const typeScores: Record<SignalType, number> = {
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

  private async updateAccountScore(accountId: string) {
    const signals = await this.prisma.signal.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
    const avgScore =
      signals.length > 0 ? Math.round(totalScore / signals.length) : 0;

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        signalScore: avgScore,
        lastSignalAt: new Date(),
      },
    });
  }

  private async updateDecisorScore(decisorId: string) {
    const signals = await this.prisma.signal.findMany({
      where: { decisorId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
    const avgScore =
      signals.length > 0 ? Math.round(totalScore / signals.length) : 0;

    await this.prisma.decisor.update({
      where: { id: decisorId },
      data: {
        engagementScore: avgScore,
        lastActivityAt: new Date(),
      },
    });
  }

  async getSignalStats(organizationId: string) {
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
}
