import { PressService } from './press.service';
import { CreatePressReleaseDto, GeneratePressReleaseDto } from './dto/create-press-release.dto';
import { PressTemplateType } from '@prisma/client';
import type { User } from '@prisma/client';
export declare class PressController {
    private readonly pressService;
    constructor(pressService: PressService);
    create(user: User, createDto: CreatePressReleaseDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    generate(user: User, generateDto: GeneratePressReleaseDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(user: User, templateType?: PressTemplateType, status?: string, limit?: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    getStats(user: User): Promise<{
        total: number;
        byTemplate: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PressReleaseGroupByOutputType, "templateType"[]> & {
            _count: number;
        })[];
        byStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PressReleaseGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        recentMonth: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: string;
        content: string;
        templateType: import("@prisma/client").$Enums.PressTemplateType;
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
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
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
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
        signalContext: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
