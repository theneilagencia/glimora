import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LinkedInEmployee {
  fullName: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  profileUrl?: string;
  avatarUrl?: string;
  location?: string;
  connectionDegree?: string;
  sharedConnections?: number;
  about?: string;
  currentCompany?: string;
  tenureAtCompany?: string;
  totalExperience?: string;
}

export interface ApifyRunResult {
  id: string;
  status: string;
  data?: LinkedInEmployee[];
}

interface ApifyRunResponse {
  data?: {
    id?: string;
    status?: string;
  };
}

interface ApifyDatasetItem {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  profileUrl?: string;
  linkedinUrl?: string;
  profilePicture?: string;
  avatarUrl?: string;
  location?: string;
  connectionDegree?: string;
  sharedConnections?: number;
  about?: string;
  currentCompany?: string;
  tenureAtCompany?: string;
  totalExperience?: string;
}

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);
  private readonly apiToken: string;
  private readonly baseUrl = 'https://api.apify.com/v2';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get<string>('APIFY_API_TOKEN') || '';
  }

  async scrapeCompanyEmployees(
    companyLinkedInUrl: string,
    limit: number = 50,
  ): Promise<LinkedInEmployee[]> {
    if (!this.apiToken) {
      this.logger.warn('APIFY_API_TOKEN not configured, using mock data');
      return this.getMockEmployees();
    }

    try {
      const actorId = 'curious_coder/linkedin-company-employees-scraper';
      const runUrl = `${this.baseUrl}/acts/${actorId}/runs?token=${this.apiToken}`;

      const response = await fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrls: [{ url: companyLinkedInUrl }],
          maxItems: limit,
          proxy: {
            useApifyProxy: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }

      const runData = (await response.json()) as ApifyRunResponse;
      const runId = runData.data?.id;

      if (!runId) {
        throw new Error('Failed to start Apify run');
      }

      this.logger.log(`Started Apify run ${runId} for ${companyLinkedInUrl}`);

      const results = await this.waitForRunCompletion(runId);
      return results;
    } catch (error) {
      this.logger.error(`Error scraping company employees: ${error}`);
      return this.getMockEmployees();
    }
  }

  private async waitForRunCompletion(
    runId: string,
    maxWaitMs: number = 300000,
  ): Promise<LinkedInEmployee[]> {
    const startTime = Date.now();
    const pollInterval = 5000;

    while (Date.now() - startTime < maxWaitMs) {
      const statusUrl = `${this.baseUrl}/actor-runs/${runId}?token=${this.apiToken}`;
      const response = await fetch(statusUrl);
      const data = (await response.json()) as ApifyRunResponse;

      if (data.data?.status === 'SUCCEEDED') {
        return this.getRunResults(runId);
      }

      if (data.data?.status === 'FAILED' || data.data?.status === 'ABORTED') {
        throw new Error(
          `Apify run ${runId} failed with status: ${data.data?.status}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Apify run ${runId} timed out`);
  }

  private async getRunResults(runId: string): Promise<LinkedInEmployee[]> {
    const datasetUrl = `${this.baseUrl}/actor-runs/${runId}/dataset/items?token=${this.apiToken}`;
    const response = await fetch(datasetUrl);
    const data = (await response.json()) as ApifyDatasetItem[];

    return data.map((item: ApifyDatasetItem) => ({
      fullName:
        item.fullName ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim(),
      firstName: item.firstName,
      lastName: item.lastName,
      title: item.title,
      profileUrl: item.profileUrl || item.linkedinUrl,
      avatarUrl: item.profilePicture || item.avatarUrl,
      location: item.location,
      connectionDegree: item.connectionDegree,
      sharedConnections: item.sharedConnections,
      about: item.about,
      currentCompany: item.currentCompany,
      tenureAtCompany: item.tenureAtCompany,
      totalExperience: item.totalExperience,
    }));
  }

  private getMockEmployees(): LinkedInEmployee[] {
    return [
      {
        fullName: 'Carlos Silva',
        firstName: 'Carlos',
        lastName: 'Silva',
        title: 'CEO & Founder',
        profileUrl: 'https://linkedin.com/in/carlos-silva',
        location: 'Sao Paulo, Brazil',
        tenureAtCompany: '5 years',
      },
      {
        fullName: 'Maria Santos',
        firstName: 'Maria',
        lastName: 'Santos',
        title: 'Diretora de Vendas',
        profileUrl: 'https://linkedin.com/in/maria-santos',
        location: 'Sao Paulo, Brazil',
        tenureAtCompany: '3 years',
      },
      {
        fullName: 'Pedro Oliveira',
        firstName: 'Pedro',
        lastName: 'Oliveira',
        title: 'Head de Marketing',
        profileUrl: 'https://linkedin.com/in/pedro-oliveira',
        location: 'Rio de Janeiro, Brazil',
        tenureAtCompany: '2 years',
      },
      {
        fullName: 'Ana Costa',
        firstName: 'Ana',
        lastName: 'Costa',
        title: 'Gerente de Compras',
        profileUrl: 'https://linkedin.com/in/ana-costa',
        location: 'Sao Paulo, Brazil',
        tenureAtCompany: '4 years',
      },
      {
        fullName: 'Lucas Ferreira',
        firstName: 'Lucas',
        lastName: 'Ferreira',
        title: 'Analista de Vendas',
        profileUrl: 'https://linkedin.com/in/lucas-ferreira',
        location: 'Belo Horizonte, Brazil',
        tenureAtCompany: '1 year',
      },
    ];
  }

  async getRunStatus(runId: string): Promise<ApifyRunResult> {
    if (!this.apiToken) {
      return { id: runId, status: 'MOCK' };
    }

    const statusUrl = `${this.baseUrl}/actor-runs/${runId}?token=${this.apiToken}`;
    const response = await fetch(statusUrl);
    const data = (await response.json()) as ApifyRunResponse;

    return {
      id: runId,
      status: data.data?.status || 'UNKNOWN',
    };
  }
}
