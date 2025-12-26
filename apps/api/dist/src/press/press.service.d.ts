import { PrismaService } from '../prisma/prisma.service';
import { CreatePressReleaseDto, GeneratePressReleaseDto } from './dto/create-press-release.dto';
import { PressTemplateType, Prisma } from '@prisma/client';
export declare class PressService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, createDto: CreatePressReleaseDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }>;
    findAll(organizationId: string, options?: {
        templateType?: PressTemplateType;
        status?: string;
        limit?: number;
    }): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }>;
    update(id: string, updateDto: Partial<CreatePressReleaseDto>): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }>;
    generate(organizationId: string, generateDto: GeneratePressReleaseDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: Prisma.JsonValue | null;
    }>;
    private generateContent;
    getStats(organizationId: string): Promise<{
        total: number;
        byTemplate: (Prisma.PickEnumerable<Prisma.PressReleaseGroupByOutputType, "templateType"[]> & {
            _count: number;
        })[];
        byStatus: (Prisma.PickEnumerable<Prisma.PressReleaseGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        recentMonth: number;
    }>;
}
