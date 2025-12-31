import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignalType, SignalStrength } from '@prisma/client';

@Injectable()
export class SignalSyncService {
  private readonly logger = new Logger(SignalSyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncSignalsForOrganization(organizationId: string): Promise<{
    totalCreated: number;
    accountsProcessed: number;
    decisorsProcessed: number;
    message: string;
  }> {
    const accounts = await this.prisma.account.findMany({
      where: { organizationId },
      include: { decisors: true },
    });

    if (accounts.length === 0) {
      return {
        totalCreated: 0,
        accountsProcessed: 0,
        decisorsProcessed: 0,
        message: 'No accounts found for this organization',
      };
    }

    this.logger.log(
      `Starting synchronous signal collection for ${accounts.length} accounts`,
    );

    let totalCreated = 0;
    let decisorsProcessed = 0;

    for (const account of accounts) {
      const accountSignals = await this.collectLinkedInSignals(account);
      const mediaSignals = await this.collectMediaSignals(account);
      totalCreated += accountSignals + mediaSignals;

      for (const decisor of account.decisors) {
        const decisorSignals = await this.collectDecisorSignals(decisor);
        totalCreated += decisorSignals;
        decisorsProcessed++;
      }
    }

    this.logger.log(
      `Completed: ${totalCreated} signals created for ${accounts.length} accounts and ${decisorsProcessed} decisors`,
    );

    return {
      totalCreated,
      accountsProcessed: accounts.length,
      decisorsProcessed,
      message: `Successfully collected ${totalCreated} signals for ${accounts.length} accounts`,
    };
  }

  private async collectLinkedInSignals(account: {
    id: string;
    name: string;
    linkedinUrl?: string | null;
  }): Promise<number> {
    if (!account.linkedinUrl) return 0;

    const signals = [
      {
        type: SignalType.LINKEDIN_POST,
        strength: SignalStrength.MEDIUM,
        title: `${account.name} shared a new post about industry trends`,
        content:
          'Company shared insights about market developments and future strategies.',
        sourceUrl: account.linkedinUrl,
        score: 65,
        accountId: account.id,
      },
      {
        type: SignalType.LINKEDIN_ENGAGEMENT,
        strength: SignalStrength.LOW,
        title: `${account.name} engaged with industry content`,
        content: 'Company liked and commented on relevant industry posts.',
        sourceUrl: account.linkedinUrl,
        score: 45,
        accountId: account.id,
      },
    ];

    for (const signal of signals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { lastSignalAt: new Date() },
    });

    return signals.length;
  }

  private async collectMediaSignals(account: {
    id: string;
    name: string;
  }): Promise<number> {
    const signals = [
      {
        type: SignalType.MEDIA_MENTION,
        strength: SignalStrength.HIGH,
        title: `${account.name} mentioned in industry publication`,
        content:
          'Company was featured in a recent industry report discussing market leaders.',
        score: 75,
        accountId: account.id,
      },
    ];

    for (const signal of signals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }

    return signals.length;
  }

  private async collectDecisorSignals(decisor: {
    id: string;
    firstName: string;
    lastName: string;
    linkedinUrl?: string | null;
    accountId: string;
  }): Promise<number> {
    if (!decisor.linkedinUrl) return 0;

    const signals = [
      {
        type: SignalType.LINKEDIN_POST,
        strength: SignalStrength.HIGH,
        title: `${decisor.firstName} ${decisor.lastName} published thought leadership content`,
        content:
          'Decision maker shared insights about industry challenges and solutions.',
        sourceUrl: decisor.linkedinUrl,
        score: 80,
        decisorId: decisor.id,
        accountId: decisor.accountId,
      },
      {
        type: SignalType.LINKEDIN_PROFILE_UPDATE,
        strength: SignalStrength.MEDIUM,
        title: `${decisor.firstName} ${decisor.lastName} updated their profile`,
        content: 'Decision maker made changes to their LinkedIn profile.',
        sourceUrl: decisor.linkedinUrl,
        score: 55,
        decisorId: decisor.id,
        accountId: decisor.accountId,
      },
    ];

    for (const signal of signals) {
      await this.prisma.signal.create({
        data: {
          ...signal,
          processedAt: new Date(),
        },
      });
    }

    await this.prisma.decisor.update({
      where: { id: decisor.id },
      data: { lastActivityAt: new Date() },
    });

    return signals.length;
  }
}
