import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorityContentDto } from './dto/create-authority-content.dto';
export declare class AuthorityService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, createDto: CreateAuthorityContentDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }>;
    findAll(organizationId: string, options?: {
        topics?: string[];
        limit?: number;
    }): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }[]>;
    findOne(id: string): Promise<{
        actions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.ActionType;
            description: string | null;
            title: string;
            priority: number;
            assignedToId: string | null;
            status: import("@prisma/client").$Enums.ActionStatus;
            suggestedMessage: string | null;
            checklist: import("@prisma/client/runtime/client").JsonValue | null;
            dueDate: Date | null;
            completedAt: Date | null;
            accountId: string | null;
            decisorId: string | null;
            signalId: string | null;
            authorityContentId: string | null;
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }>;
    update(id: string, updateDto: Partial<CreateAuthorityContentDto>): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }>;
    findByTopics(organizationId: string, topics: string[]): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }[]>;
    getTopContent(organizationId: string, limit?: number): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }[]>;
    matchContentToSignal(organizationId: string, signalTopics: string[]): Promise<{
        relevanceScore: number;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        summary: string | null;
        content: string;
        sourceUrl: string | null;
        topics: string[];
        publishedAt: Date | null;
        engagementCount: number;
    }[]>;
    private calculateRelevanceScore;
    getAllTopics(organizationId: string): Promise<string[]>;
    getStats(organizationId: string): Promise<{
        total: number;
        topTopics: string[];
        recentMonth: number;
    }>;
}
