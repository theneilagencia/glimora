import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => JobsService))
    private jobsService: JobsService,
  ) {}

  async create(organizationId: string, createAccountDto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: {
        ...createAccountDto,
        organizationId,
      },
      include: {
        assignedTo: true,
        decisors: true,
      },
    });

    // Trigger decisor detection if account has a LinkedIn URL
    if (createAccountDto.linkedinUrl) {
      this.triggerDecisorDetection(organizationId, account.id);
    }

    return account;
  }

  private triggerDecisorDetection(organizationId: string, accountId: string) {
    // Run in background, don't block account creation
    this.jobsService
      .scheduleDecisorDetection(organizationId, accountId)
      .then(() => {
        this.logger.log(`Triggered decisor detection for account ${accountId}`);
      })
      .catch((error: Error) => {
        this.logger.warn(
          `Failed to trigger decisor detection for account ${accountId}: ${error.message}`,
        );
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
    // Check if LinkedIn URL is being added/updated
    const existingAccount = updateDto.linkedinUrl
      ? await this.prisma.account.findUnique({
          where: { id },
          select: { linkedinUrl: true, organizationId: true },
        })
      : null;

    const account = await this.prisma.account.update({
      where: { id },
      data: updateDto,
      include: {
        assignedTo: true,
        decisors: true,
      },
    });

    // Trigger decisor detection if LinkedIn URL was added or changed
    if (
      updateDto.linkedinUrl &&
      existingAccount &&
      existingAccount.linkedinUrl !== updateDto.linkedinUrl
    ) {
      this.triggerDecisorDetection(account.organizationId, account.id);
    }

    return account;
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
