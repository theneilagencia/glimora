import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createAccountDto: CreateAccountDto) {
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

  async findAll(
    organizationId: string,
    options?: { sortBy?: string; limit?: number },
  ) {
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
      orderBy:
        options?.sortBy === 'priority'
          ? { priority: 'desc' }
          : { signalScore: 'desc' },
      take: options?.limit,
    });
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(id: string, updateDto: Partial<CreateAccountDto>) {
    return this.prisma.account.update({
      where: { id },
      data: updateDto,
      include: {
        assignedTo: true,
        decisors: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }

  async assignTo(id: string, userId: string) {
    return this.prisma.account.update({
      where: { id },
      data: { assignedToId: userId },
      include: {
        assignedTo: true,
      },
    });
  }

  async updateSignalScore(id: string, score: number) {
    return this.prisma.account.update({
      where: { id },
      data: {
        signalScore: score,
        lastSignalAt: new Date(),
      },
    });
  }

  async getTopAccounts(organizationId: string, limit: number = 10) {
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

  async getAccountsWithRecentSignals(organizationId: string, days: number = 7) {
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
}
