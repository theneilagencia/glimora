import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePressReleaseDto,
  GeneratePressReleaseDto,
} from './dto/create-press-release.dto';
import { PressTemplateType } from '@prisma/client';

@Injectable()
export class PressService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createDto: CreatePressReleaseDto) {
    return this.prisma.pressRelease.create({
      data: {
        ...createDto,
        organizationId,
      },
    });
  }

  async findAll(
    organizationId: string,
    options?: {
      templateType?: PressTemplateType;
      status?: string;
      limit?: number;
    },
  ) {
    const where: Record<string, unknown> = { organizationId };

    if (options?.templateType) {
      where.templateType = options.templateType;
    }

    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.pressRelease.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
    });
  }

  async findOne(id: string) {
    const pressRelease = await this.prisma.pressRelease.findUnique({
      where: { id },
    });

    if (!pressRelease) {
      throw new NotFoundException(`Press release with ID ${id} not found`);
    }

    return pressRelease;
  }

  async update(id: string, updateDto: Partial<CreatePressReleaseDto>) {
    return this.prisma.pressRelease.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    return this.prisma.pressRelease.delete({
      where: { id },
    });
  }

  async generate(organizationId: string, generateDto: GeneratePressReleaseDto) {
    const {
      templateType,
      signalId,
      topic,
      companyName,
      ceoName,
      productName,
      partnerName,
    } = generateDto;

    let signalContext: Record<string, unknown> = {};

    if (signalId) {
      const signal = await this.prisma.signal.findUnique({
        where: { id: signalId },
        include: { account: true, decisor: true },
      });

      if (signal) {
        signalContext = {
          signalTitle: signal.title,
          signalContent: signal.content,
          accountName: signal.account?.name,
          decisorName: signal.decisor
            ? `${signal.decisor.firstName} ${signal.decisor.lastName}`
            : undefined,
        };
      }
    }

    const content = this.generateContent(templateType, {
      topic: topic || 'industry innovation',
      companyName: companyName || 'Your Company',
      ceoName: ceoName || 'CEO Name',
      productName: productName || 'Product Name',
      partnerName: partnerName || 'Partner Name',
      ...signalContext,
    });

    return this.prisma.pressRelease.create({
      data: {
        title: content.title,
        content: content.body,
        templateType,
        status: 'draft',
        signalContext,
        organizationId,
      },
    });
  }

  private generateContent(
    templateType: PressTemplateType,
    context: Record<string, string | undefined>,
  ): { title: string; body: string } {
    const templates = {
      [PressTemplateType.PRODUCT_LAUNCH]: {
        title: `${context.companyName} Announces Launch of ${context.productName}`,
        body: `FOR IMMEDIATE RELEASE

${context.companyName} Unveils ${context.productName}, Transforming ${context.topic}

[City, Date] - ${context.companyName}, a leader in ${context.topic}, today announced the launch of ${context.productName}, a groundbreaking solution designed to revolutionize how businesses approach ${context.topic}.

"We are thrilled to introduce ${context.productName} to the market," said ${context.ceoName}, CEO of ${context.companyName}. "This product represents our commitment to innovation and our dedication to helping our customers succeed in an increasingly competitive landscape."

Key Features of ${context.productName}:
- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]

${context.productName} is available starting [date] and can be accessed through [channel].

About ${context.companyName}
${context.companyName} is a leading provider of [industry] solutions, helping businesses [value proposition]. For more information, visit [website].

Media Contact:
[Contact Name]
[Email]
[Phone]

###`,
      },
      [PressTemplateType.PARTNERSHIP]: {
        title: `${context.companyName} and ${context.partnerName} Announce Strategic Partnership`,
        body: `FOR IMMEDIATE RELEASE

${context.companyName} Partners with ${context.partnerName} to Advance ${context.topic}

[City, Date] - ${context.companyName} and ${context.partnerName} today announced a strategic partnership aimed at accelerating innovation in ${context.topic}.

The collaboration brings together ${context.companyName}'s expertise in [area] with ${context.partnerName}'s leadership in [area], creating a powerful combination that will deliver unprecedented value to customers.

"This partnership represents a significant milestone for both organizations," said ${context.ceoName}, CEO of ${context.companyName}. "By combining our strengths, we can offer our customers more comprehensive solutions and drive meaningful progress in ${context.topic}."

Key Benefits of the Partnership:
- Benefit 1: [Description]
- Benefit 2: [Description]
- Benefit 3: [Description]

The partnership is effective immediately, with joint solutions expected to be available in [timeframe].

About ${context.companyName}
${context.companyName} is a leading provider of [industry] solutions. For more information, visit [website].

About ${context.partnerName}
${context.partnerName} is a [description]. For more information, visit [website].

Media Contact:
[Contact Name]
[Email]
[Phone]

###`,
      },
      [PressTemplateType.THOUGHT_LEADERSHIP]: {
        title: `${context.ceoName} of ${context.companyName} Shares Insights on ${context.topic}`,
        body: `FOR IMMEDIATE RELEASE

${context.companyName} CEO ${context.ceoName} Addresses Key Trends in ${context.topic}

[City, Date] - ${context.ceoName}, CEO of ${context.companyName}, today shared expert insights on the evolving landscape of ${context.topic}, highlighting key trends and opportunities for businesses.

In a recent [interview/presentation/article], ${context.ceoName} discussed how organizations can navigate the challenges and capitalize on the opportunities presented by ${context.topic}.

"The ${context.topic} landscape is evolving rapidly, and businesses that adapt quickly will be best positioned for success," said ${context.ceoName}. "At ${context.companyName}, we've been at the forefront of this transformation, and we're committed to helping our customers stay ahead of the curve."

Key Insights from ${context.ceoName}:

1. [Insight 1]: [Explanation]

2. [Insight 2]: [Explanation]

3. [Insight 3]: [Explanation]

${context.ceoName}'s full insights are available at [link].

About ${context.companyName}
${context.companyName} is a leading provider of [industry] solutions, helping businesses [value proposition]. For more information, visit [website].

Media Contact:
[Contact Name]
[Email]
[Phone]

###`,
      },
    };

    return templates[templateType];
  }

  async getStats(organizationId: string) {
    const [total, byTemplate, byStatus, recent] = await Promise.all([
      this.prisma.pressRelease.count({ where: { organizationId } }),
      this.prisma.pressRelease.groupBy({
        by: ['templateType'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.pressRelease.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.pressRelease.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      byTemplate,
      byStatus,
      recentMonth: recent,
    };
  }
}
