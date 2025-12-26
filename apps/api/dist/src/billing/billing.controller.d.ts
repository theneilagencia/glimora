import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './dto/create-subscription.dto';
import type { User } from '@prisma/client';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getPlans(): {
        starter: {
            name: string;
            priceId: string;
            price: number;
            features: string[];
        };
        professional: {
            name: string;
            priceId: string;
            price: number;
            features: string[];
        };
        enterprise: {
            name: string;
            priceId: string;
            price: number;
            features: string[];
        };
    };
    createCheckoutSession(user: User, createDto: CreateCheckoutSessionDto): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    createPortalSession(user: User, createDto: CreatePortalSessionDto): Promise<{
        url: string;
    }>;
    getSubscriptionStatus(user: User): Promise<{
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        trialEndsAt: Date | null;
        isActive: boolean;
    }>;
    handleWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
