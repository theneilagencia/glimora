import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDecisorDto } from './dto/create-decisor.dto';
import { DecisorFeedback, DecisorLabel } from '@prisma/client';

@Injectable()
export class DecisorsService implements OnModuleInit {
  private readonly logger = new Logger(DecisorsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.cleanupAllMockDecisors();
  }

  private async cleanupAllMockDecisors() {
    const mockLinkedInUrls = [
      'https://linkedin.com/in/carlos-silva',
      'https://linkedin.com/in/maria-santos',
      'https://linkedin.com/in/pedro-oliveira',
      'https://linkedin.com/in/ana-costa',
      'https://linkedin.com/in/lucas-ferreira',
    ];

    try {
      const result = await this.prisma.decisor.deleteMany({
        where: {
          linkedinUrl: { in: mockLinkedInUrls },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} mock decisors on startup`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup mock decisors: ${error}`);
    }
  }

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

  async submitFeedback(
    id: string,
    feedback: DecisorFeedback,
    notes: string | undefined,
    userId: string,
  ) {
    const decisor = await this.prisma.decisor.findUnique({
      where: { id },
    });

    if (!decisor) {
      throw new NotFoundException(`Decisor with ID ${id} not found`);
    }

    let newLabel: DecisorLabel | undefined;
    let newScore: number | undefined;

    if (feedback === DecisorFeedback.CONFIRMED_DECISOR) {
      newLabel = DecisorLabel.DECISOR_PROVAVEL;
      newScore = Math.max(decisor.decisorScore, 85);
    } else if (feedback === DecisorFeedback.NOT_DECISOR) {
      newLabel = DecisorLabel.CONTATO_IRRELEVANTE;
      newScore = Math.min(decisor.decisorScore, 30);
    }

    return this.prisma.decisor.update({
      where: { id },
      data: {
        sellerFeedback: feedback,
        feedbackNotes: notes,
        feedbackAt: new Date(),
        feedbackByUserId: userId,
        ...(newLabel && { decisorLabel: newLabel }),
        ...(newScore !== undefined && { decisorScore: newScore }),
      },
      include: {
        account: true,
      },
    });
  }

  async getDecisorsByLabel(organizationId: string, label: DecisorLabel) {
    return this.prisma.decisor.findMany({
      where: {
        account: { organizationId },
        decisorLabel: label,
      },
      orderBy: { decisorScore: 'desc' },
      include: {
        account: true,
        _count: {
          select: {
            signals: true,
            actions: true,
          },
        },
      },
    });
  }

  async getTopDecisorsByScore(organizationId: string, limit: number = 10) {
    return this.prisma.decisor.findMany({
      where: {
        account: { organizationId },
        decisorLabel: {
          in: [
            DecisorLabel.DECISOR_PROVAVEL,
            DecisorLabel.INFLUENCIADOR_POTENCIAL,
          ],
        },
      },
      orderBy: { decisorScore: 'desc' },
      take: limit,
      include: {
        account: true,
        _count: {
          select: {
            signals: true,
            actions: true,
          },
        },
      },
    });
  }

  async getDecisorStats(organizationId: string) {
    const [total, byLabel, avgScore, withFeedback] = await Promise.all([
      this.prisma.decisor.count({
        where: { account: { organizationId } },
      }),
      this.prisma.decisor.groupBy({
        by: ['decisorLabel'],
        where: { account: { organizationId } },
        _count: true,
      }),
      this.prisma.decisor.aggregate({
        where: { account: { organizationId } },
        _avg: { decisorScore: true },
      }),
      this.prisma.decisor.count({
        where: {
          account: { organizationId },
          sellerFeedback: { not: null },
        },
      }),
    ]);

    return {
      total,
      byLabel,
      averageScore: avgScore._avg.decisorScore || 0,
      withFeedback,
    };
  }

  async deleteMockDecisors(organizationId: string) {
    const mockLinkedInUrls = [
      'https://linkedin.com/in/carlos-silva',
      'https://linkedin.com/in/maria-santos',
      'https://linkedin.com/in/pedro-oliveira',
      'https://linkedin.com/in/ana-costa',
      'https://linkedin.com/in/lucas-ferreira',
    ];

    const result = await this.prisma.decisor.deleteMany({
      where: {
        account: { organizationId },
        linkedinUrl: { in: mockLinkedInUrls },
      },
    });

    return {
      deleted: result.count,
      message: `Deleted ${result.count} mock decisors`,
    };
  }
}
