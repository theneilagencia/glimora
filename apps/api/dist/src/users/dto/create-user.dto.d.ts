import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    avatarUrl?: string;
    organizationId: string;
}
