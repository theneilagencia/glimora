import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        organization: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            stripeCustomerId: string | null;
            subscriptionId: string | null;
            subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
            trialEndsAt: Date | null;
        };
    } & {
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
    }>;
    findAll(organizationId: string): Promise<({
        organization: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            stripeCustomerId: string | null;
            subscriptionId: string | null;
            subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
            trialEndsAt: Date | null;
        };
        assignedAccounts: {
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
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        organization: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            stripeCustomerId: string | null;
            subscriptionId: string | null;
            subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
            trialEndsAt: Date | null;
        };
        assignedAccounts: {
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
        clerkId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByClerkId(clerkId: string): Promise<{
        organization: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            stripeCustomerId: string | null;
            subscriptionId: string | null;
            subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
            trialEndsAt: Date | null;
        };
        assignedAccounts: {
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
    } & {
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
    }>;
    updateRole(id: string, role: UserRole): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    syncFromClerk(clerkId: string, email: string, firstName?: string, lastName?: string, avatarUrl?: string): Promise<{
        organization: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            stripeCustomerId: string | null;
            subscriptionId: string | null;
            subscriptionStatus: import("@prisma/client").$Enums.SubscriptionStatus;
            trialEndsAt: Date | null;
        };
    } & {
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
    }>;
}
