import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class BillingService {
    private configService;
    private prisma;
    private readonly logger;
    private stripe;
    readonly PLANS: {
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
    constructor(configService: ConfigService, prisma: PrismaService);
    createCheckoutSession(organizationId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    createPortalSession(organizationId: string, returnUrl: string): Promise<{
        url: string;
    }>;
    handleWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentFailed;
    getSubscriptionStatus(organizationId: string): Promise<{
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        trialEndsAt: Date | null;
        isActive: boolean;
    }>;
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
}
