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
  name?: string;
  title?: string;
  headline?: string;
  profileUrl?: string;
  linkedinUrl?: string;
  url?: string;
  profilePicture?: string;
  avatarUrl?: string;
  photo?: string;
  location?: string | { linkedinText?: string };
  connectionDegree?: string;
  sharedConnections?: number;
  about?: string;
  summary?: string;
  currentCompany?: string;
  company?: string;
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
      this.logger.error(
        'APIFY_API_TOKEN not configured - cannot scrape employees',
      );
      return [];
    }

    try {
      // Using harvestapi~linkedin-company-employees actor (no cookies required)
      // Note: Apify API requires tilde (~) not slash (/) in actor identifier
      const actorId = 'harvestapi~linkedin-company-employees';
      const runUrl = `${this.baseUrl}/acts/${actorId}/runs?token=${this.apiToken}`;

      this.logger.log(
        `Starting Apify scrape for company: ${companyLinkedInUrl}`,
      );

      const response = await fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companies: [companyLinkedInUrl],
          maxItems: limit,
          profileScraperMode: 'Short ($4 per 1k)',
          companyBatchMode: 'one_by_one',
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
      return [];
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

    this.logger.log(`Apify run ${runId} returned ${data.length} results`);

    return data.map((item: ApifyDatasetItem) => {
      const fullName =
        item.fullName ||
        item.name ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim();

      // Handle location field - can be string or object with linkedinText
      let locationStr: string | undefined;
      if (typeof item.location === 'string') {
        locationStr = item.location;
      } else if (item.location && typeof item.location === 'object') {
        locationStr = item.location.linkedinText;
      }

      return {
        fullName,
        firstName: item.firstName || fullName.split(' ')[0],
        lastName: item.lastName || fullName.split(' ').slice(1).join(' '),
        title: item.title || item.headline,
        profileUrl: item.profileUrl || item.linkedinUrl || item.url,
        avatarUrl: item.profilePicture || item.avatarUrl || item.photo,
        location: locationStr,
        connectionDegree: item.connectionDegree,
        sharedConnections: item.sharedConnections,
        about: item.about || item.summary,
        currentCompany: item.currentCompany || item.company,
        tenureAtCompany: item.tenureAtCompany,
        totalExperience: item.totalExperience,
      };
    });
  }

  async getRunStatus(runId: string): Promise<ApifyRunResult> {
    if (!this.apiToken) {
      return { id: runId, status: 'NO_TOKEN' };
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
