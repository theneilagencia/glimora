import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorityContentDto } from './dto/create-authority-content.dto';

@Injectable()
export class AuthorityService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createDto: CreateAuthorityContentDto) {
    return this.prisma.authorityContent.create({
      data: {
        ...createDto,
        publishedAt: createDto.publishedAt
          ? new Date(createDto.publishedAt)
          : undefined,
        organizationId,
      },
    });
  }

  async findAll(
    organizationId: string,
    options?: { topics?: string[]; limit?: number },
  ) {
    const where: Record<string, unknown> = { organizationId };

    if (options?.topics && options.topics.length > 0) {
      where.topics = { hasSome: options.topics };
    }

    return this.prisma.authorityContent.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: options?.limit,
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.authorityContent.findUnique({
      where: { id },
      include: {
        actions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`Authority content with ID ${id} not found`);
    }

    return content;
  }

  async update(id: string, updateDto: Partial<CreateAuthorityContentDto>) {
    return this.prisma.authorityContent.update({
      where: { id },
      data: {
        ...updateDto,
        publishedAt: updateDto.publishedAt
          ? new Date(updateDto.publishedAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.authorityContent.delete({
      where: { id },
    });
  }

  async findByTopics(organizationId: string, topics: string[]) {
    return this.prisma.authorityContent.findMany({
      where: {
        organizationId,
        topics: { hasSome: topics },
      },
      orderBy: { engagementCount: 'desc' },
    });
  }

  async getTopContent(organizationId: string, limit: number = 10) {
    return this.prisma.authorityContent.findMany({
      where: { organizationId },
      orderBy: { engagementCount: 'desc' },
      take: limit,
    });
  }

  async matchContentToSignal(organizationId: string, signalTopics: string[]) {
    const matchedContent = await this.prisma.authorityContent.findMany({
      where: {
        organizationId,
        topics: { hasSome: signalTopics },
      },
      orderBy: { engagementCount: 'desc' },
      take: 5,
    });

    return matchedContent.map((content) => ({
      ...content,
      relevanceScore: this.calculateRelevanceScore(
        content.topics,
        signalTopics,
      ),
    }));
  }

  private calculateRelevanceScore(
    contentTopics: string[],
    signalTopics: string[],
  ): number {
    const matchingTopics = contentTopics.filter((topic) =>
      signalTopics.some(
        (st) =>
          st.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(st.toLowerCase()),
      ),
    );
    return Math.round(
      (matchingTopics.length /
        Math.max(contentTopics.length, signalTopics.length)) *
        100,
    );
  }

  async getAllTopics(organizationId: string) {
    const contents = await this.prisma.authorityContent.findMany({
      where: { organizationId },
      select: { topics: true },
    });

    const allTopics = contents.flatMap((c) => c.topics);
    const uniqueTopics = [...new Set(allTopics)];

    return uniqueTopics.sort();
  }

  async getStats(organizationId: string) {
    const [total, topTopics, recentContent] = await Promise.all([
      this.prisma.authorityContent.count({ where: { organizationId } }),
      this.getAllTopics(organizationId),
      this.prisma.authorityContent.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      topTopics: topTopics.slice(0, 10),
      recentMonth: recentContent,
    };
  }
}
