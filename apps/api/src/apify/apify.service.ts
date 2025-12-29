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

interface ApifyCurrentPosition {
  title?: string;
  companyName?: string;
  companyId?: string;
  companyLinkedinUrl?: string;
  description?: string;
  current?: boolean;
  tenureAtPosition?: {
    numYears?: number;
    numMonths?: number;
  };
  tenureAtCompany?: {
    numYears?: number;
    numMonths?: number;
  };
  startedOn?: {
    month?: number;
    year?: number;
  };
}

interface ApifyDatasetItem {
  id?: string;
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
  pictureUrl?: string;
  avatarUrl?: string;
  photo?: string;
  location?: string | { linkedinText?: string };
  connectionDegree?: string;
  sharedConnections?: number;
  about?: string;
  summary?: string;
  currentCompany?: string;
  company?: string;
  currentPositions?: ApifyCurrentPosition[];
  tenureAtCompany?: string | { numYears?: number; numMonths?: number };
  totalExperience?: string;
  openProfile?: boolean;
  premium?: boolean;
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

      // Get current position data (title, company, tenure)
      const currentPosition = item.currentPositions?.[0];
      const title =
        item.title ||
        item.headline ||
        currentPosition?.title;
      const currentCompany =
        item.currentCompany ||
        item.company ||
        currentPosition?.companyName;

      // Calculate tenure in months from currentPosition
      let tenureAtCompanyStr: string | undefined;
      if (currentPosition?.tenureAtCompany) {
        const years = currentPosition.tenureAtCompany.numYears || 0;
        const months = currentPosition.tenureAtCompany.numMonths || 0;
        const totalMonths = years * 12 + months;
        tenureAtCompanyStr = `${totalMonths} months`;
      } else if (typeof item.tenureAtCompany === 'string') {
        tenureAtCompanyStr = item.tenureAtCompany;
      } else if (
        item.tenureAtCompany &&
        typeof item.tenureAtCompany === 'object'
      ) {
        const years = item.tenureAtCompany.numYears || 0;
        const months = item.tenureAtCompany.numMonths || 0;
        const totalMonths = years * 12 + months;
        tenureAtCompanyStr = `${totalMonths} months`;
      }

      // Get avatar URL - try multiple field names
      const avatarUrl =
        item.pictureUrl ||
        item.profilePicture ||
        item.avatarUrl ||
        item.photo;

      // Get profile URL - normalize LinkedIn URL
      const profileUrl = item.profileUrl || item.linkedinUrl || item.url;

      return {
        fullName,
        firstName: item.firstName?.trim() || fullName.split(' ')[0],
        lastName: item.lastName?.trim() || fullName.split(' ').slice(1).join(' '),
        title,
        profileUrl,
        avatarUrl,
        location: locationStr,
        connectionDegree: item.connectionDegree,
        sharedConnections: item.sharedConnections,
        about: item.about || item.summary,
        currentCompany,
        tenureAtCompany: tenureAtCompanyStr,
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
