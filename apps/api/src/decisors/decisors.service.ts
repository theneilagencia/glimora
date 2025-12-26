import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDecisorDto } from './dto/create-decisor.dto';

@Injectable()
export class DecisorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDecisorDto: CreateDecisorDto) {
    return this.prisma.decisor.create({
      data: createDecisorDto,
      include: {
        account: true,
      },
    });
  }

  async findAll(accountId: string) {
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

  async findAllByOrganization(organizationId: string) {
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Decisor with ID ${id} not found`);
    }

    return decisor;
  }

  async update(id: string, updateDto: Partial<CreateDecisorDto>) {
    return this.prisma.decisor.update({
      where: { id },
      data: updateDto,
      include: {
        account: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.decisor.delete({
      where: { id },
    });
  }

  async updateEngagementScore(id: string, score: number) {
    return this.prisma.decisor.update({
      where: { id },
      data: {
        engagementScore: score,
        lastActivityAt: new Date(),
      },
    });
  }

  async getTopDecisors(organizationId: string, limit: number = 10) {
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

  async getDecisorsWithRecentActivity(
    organizationId: string,
    days: number = 7,
  ) {
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
}
