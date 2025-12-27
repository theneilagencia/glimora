import { Injectable, Logger } from '@nestjs/common';
import { DecisorLabel } from '@prisma/client';
import { LinkedInEmployee } from '../apify/apify.service';

export interface DecisorScoreInput {
  title?: string;
  department?: string;
  tenureMonths?: number;
  lastPublicActivity?: Date;
  interactedWithCeo?: boolean;
  interactedWithBrand?: boolean;
  profileComplete?: boolean;
  about?: string;
}

export interface DecisorScoreResult {
  score: number;
  label: DecisorLabel;
  breakdown: {
    titleScore: number;
    departmentScore: number;
    tenureScore: number;
    activityScore: number;
    ceoInteractionScore: number;
    profileScore: number;
    influenceScore: number;
  };
}

@Injectable()
export class DecisorScoreService {
  private readonly logger = new Logger(DecisorScoreService.name);

  private readonly DECISION_MAKER_TITLES = [
    'ceo',
    'cfo',
    'cto',
    'coo',
    'cmo',
    'cio',
    'chro',
    'diretor',
    'director',
    'head',
    'gerente',
    'manager',
    'socio',
    'partner',
    'founder',
    'fundador',
    'presidente',
    'president',
    'vice-presidente',
    'vp',
    'owner',
    'proprietario',
    'chief',
  ];

  private readonly TARGET_DEPARTMENTS = [
    'vendas',
    'sales',
    'compras',
    'procurement',
    'purchasing',
    'marketing',
    'comercial',
    'business',
    'negocios',
    'financeiro',
    'finance',
    'operacoes',
    'operations',
    'ti',
    'it',
    'tecnologia',
    'technology',
    'rh',
    'hr',
    'recursos humanos',
    'human resources',
  ];

  private readonly INFLUENCE_KEYWORDS = [
    'lider',
    'leader',
    'estrategia',
    'strategy',
    'decisao',
    'decision',
    'inovacao',
    'innovation',
    'transformacao',
    'transformation',
    'digital',
    'growth',
    'crescimento',
    'resultado',
    'results',
    'performance',
    'expert',
    'especialista',
    'senior',
    'principal',
    'executive',
    'executivo',
  ];

  calculateScore(input: DecisorScoreInput): DecisorScoreResult {
    const breakdown = {
      titleScore: this.calculateTitleScore(input.title),
      departmentScore: this.calculateDepartmentScore(
        input.department,
        input.title,
      ),
      tenureScore: this.calculateTenureScore(input.tenureMonths),
      activityScore: this.calculateActivityScore(input.lastPublicActivity),
      ceoInteractionScore: this.calculateCeoInteractionScore(
        input.interactedWithCeo,
        input.interactedWithBrand,
      ),
      profileScore: this.calculateProfileScore(input.profileComplete),
      influenceScore: this.calculateInfluenceScore(input.about, input.title),
    };

    const totalScore = Math.min(
      100,
      breakdown.titleScore +
        breakdown.departmentScore +
        breakdown.tenureScore +
        breakdown.activityScore +
        breakdown.ceoInteractionScore +
        breakdown.profileScore +
        breakdown.influenceScore,
    );

    const label = this.getLabel(totalScore);

    return {
      score: totalScore,
      label,
      breakdown,
    };
  }

  private calculateTitleScore(title?: string): number {
    if (!title) return 0;

    const normalizedTitle = title.toLowerCase();
    const hasDecisionMakerTitle = this.DECISION_MAKER_TITLES.some((t) =>
      normalizedTitle.includes(t),
    );

    return hasDecisionMakerTitle ? 25 : 0;
  }

  private calculateDepartmentScore(
    department?: string,
    title?: string,
  ): number {
    const textToCheck = `${department || ''} ${title || ''}`.toLowerCase();

    const isTargetDepartment = this.TARGET_DEPARTMENTS.some((d) =>
      textToCheck.includes(d),
    );

    return isTargetDepartment ? 20 : 0;
  }

  private calculateTenureScore(tenureMonths?: number): number {
    if (!tenureMonths) return 0;
    return tenureMonths >= 12 ? 10 : 0;
  }

  private calculateActivityScore(lastPublicActivity?: Date): number {
    if (!lastPublicActivity) return 0;

    const now = new Date();
    const diffMs = now.getTime() - lastPublicActivity.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= 30 ? 10 : 0;
  }

  private calculateCeoInteractionScore(
    interactedWithCeo?: boolean,
    interactedWithBrand?: boolean,
  ): number {
    let score = 0;
    if (interactedWithCeo) score += 10;
    if (interactedWithBrand) score += 5;
    return Math.min(15, score);
  }

  private calculateProfileScore(profileComplete?: boolean): number {
    return profileComplete ? 10 : 0;
  }

  private calculateInfluenceScore(about?: string, title?: string): number {
    const textToCheck = `${about || ''} ${title || ''}`.toLowerCase();

    const influenceKeywordCount = this.INFLUENCE_KEYWORDS.filter((k) =>
      textToCheck.includes(k),
    ).length;

    return Math.min(10, influenceKeywordCount * 2);
  }

  private getLabel(score: number): DecisorLabel {
    if (score >= 80) return DecisorLabel.DECISOR_PROVAVEL;
    if (score >= 60) return DecisorLabel.INFLUENCIADOR_POTENCIAL;
    return DecisorLabel.CONTATO_IRRELEVANTE;
  }

  parseLinkedInEmployee(employee: LinkedInEmployee): DecisorScoreInput {
    const tenureMonths = this.parseTenure(employee.tenureAtCompany);

    return {
      title: employee.title,
      department: this.extractDepartment(employee.title),
      tenureMonths,
      profileComplete: !!(
        employee.fullName &&
        employee.title &&
        employee.profileUrl
      ),
      about: employee.about,
    };
  }

  private parseTenure(tenureString?: string): number | undefined {
    if (!tenureString) return undefined;

    const normalized = tenureString.toLowerCase();

    const yearsMatch = normalized.match(/(\d+)\s*(year|ano|yr)/);
    const monthsMatch = normalized.match(/(\d+)\s*(month|mes|mo)/);

    let totalMonths = 0;

    if (yearsMatch) {
      totalMonths += parseInt(yearsMatch[1], 10) * 12;
    }

    if (monthsMatch) {
      totalMonths += parseInt(monthsMatch[1], 10);
    }

    return totalMonths > 0 ? totalMonths : undefined;
  }

  private extractDepartment(title?: string): string | undefined {
    if (!title) return undefined;

    const normalized = title.toLowerCase();

    for (const dept of this.TARGET_DEPARTMENTS) {
      if (normalized.includes(dept)) {
        return dept;
      }
    }

    return undefined;
  }
}
