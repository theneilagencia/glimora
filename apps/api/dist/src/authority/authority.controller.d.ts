import { AuthorityService } from './authority.service';
import { CreateAuthorityContentDto } from './dto/create-authority-content.dto';
import type { User } from '@prisma/client';
export declare class AuthorityController {
    private readonly authorityService;
    constructor(authorityService: AuthorityService);
    create(user: User, createDto: CreateAuthorityContentDto): Promise<{
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
    findAll(user: User, topics?: string, limit?: string): Promise<{
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
    getTopContent(user: User, limit?: string): Promise<{
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
    getAllTopics(user: User): Promise<string[]>;
    getStats(user: User): Promise<{
        total: number;
        topTopics: string[];
        recentMonth: number;
    }>;
    matchToSignal(user: User, topics: string): Promise<{
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
}
