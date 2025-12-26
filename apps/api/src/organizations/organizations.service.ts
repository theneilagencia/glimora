import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
        accounts: {
          take: 10,
          orderBy: { signalScore: 'desc' },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: string, data: Partial<CreateOrganizationDto>) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async getStats(id: string) {
    const [accountCount, userCount, signalCount, actionCount] =
      await Promise.all([
        this.prisma.account.count({ where: { organizationId: id } }),
        this.prisma.user.count({ where: { organizationId: id } }),
        this.prisma.signal.count({
          where: { account: { organizationId: id } },
        }),
        this.prisma.action.count({
          where: { account: { organizationId: id } },
        }),
      ]);

    return {
      accountCount,
      userCount,
      signalCount,
      actionCount,
    };
  }
}
