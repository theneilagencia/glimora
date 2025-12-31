import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
        trialEndsAt: Date | null;
    }>;
    findOne(id: string): Promise<{
        accounts: {
            name: string;
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            industry: string | null;
            website: string | null;
            linkedinUrl: string | null;
            logoUrl: string | null;
            employeeCount: number | null;
            revenue: string | null;
            priority: number;
            signalScore: number;
            lastSignalAt: Date | null;
            assignedToId: string | null;
        }[];
        users: {
            id: string;
            clerkId: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
        trialEndsAt: Date | null;
    }>;
    update(id: string, data: Partial<CreateOrganizationDto>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
        stripeCustomerId: string | null;
        subscriptionId: string | null;
        subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
        trialEndsAt: Date | null;
    }>;
    getStats(id: string): Promise<{
        accountCount: number;
        userCount: number;
        signalCount: number;
        actionCount: number;
    }>;
}
