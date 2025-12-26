"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BillingService = BillingService_1 = class BillingService {
    configService;
    prisma;
    logger = new common_1.Logger(BillingService_1.name);
    stripe;
    PLANS = {
        starter: {
            name: 'Starter',
            priceId: 'price_starter_monthly',
            price: 49,
            features: ['Up to 10 accounts', 'Basic signals', 'Email support'],
        },
        professional: {
            name: 'Professional',
            priceId: 'price_professional_monthly',
            price: 149,
            features: [
                'Up to 50 accounts',
                'Advanced signals',
                'Priority support',
                'Press releases',
            ],
        },
        enterprise: {
            name: 'Enterprise',
            priceId: 'price_enterprise_monthly',
            price: 399,
            features: [
                'Unlimited accounts',
                'All features',
                'Dedicated support',
                'Custom integrations',
            ],
        },
    };
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
            this.stripe = new stripe_1.default(stripeSecretKey);
        }
    }
    async createCheckoutSession(organizationId, priceId, successUrl, cancelUrl) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            throw new common_1.BadRequestException('Organization not found');
        }
        let customerId = organization.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                metadata: { organizationId },
            });
            customerId = customer.id;
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: { stripeCustomerId: customerId },
            });
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 7,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { organizationId },
        });
        return { sessionId: session.id, url: session.url };
    }
    async createPortalSession(organizationId, returnUrl) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization?.stripeCustomerId) {
            throw new common_1.BadRequestException('No billing account found');
        }
        const session = await this.stripe.billingPortal.sessions.create({
            customer: organization.stripeCustomerId,
            return_url: returnUrl,
        });
        return { url: session.url };
    }
    async handleWebhook(signature, payload) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(`Webhook signature verification failed: ${errorMessage}`);
            throw new common_1.BadRequestException('Webhook signature verification failed');
        }
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    async handleCheckoutCompleted(session) {
        const organizationId = session.metadata?.organizationId;
        if (!organizationId)
            return;
        await this.prisma.organization.update({
            where: { id: organizationId },
            data: {
                subscriptionId: session.subscription,
                subscriptionStatus: client_1.SubscriptionStatus.TRIAL,
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        this.logger.log(`Checkout completed for organization ${organizationId}`);
    }
    async handleSubscriptionUpdated(subscription) {
        const organization = await this.prisma.organization.findFirst({
            where: { subscriptionId: subscription.id },
        });
        if (!organization)
            return;
        let status;
        switch (subscription.status) {
            case 'trialing':
                status = client_1.SubscriptionStatus.TRIAL;
                break;
            case 'active':
                status = client_1.SubscriptionStatus.ACTIVE;
                break;
            case 'past_due':
                status = client_1.SubscriptionStatus.PAST_DUE;
                break;
            case 'canceled':
                status = client_1.SubscriptionStatus.CANCELED;
                break;
            default:
                status = client_1.SubscriptionStatus.EXPIRED;
        }
        await this.prisma.organization.update({
            where: { id: organization.id },
            data: {
                subscriptionStatus: status,
                trialEndsAt: subscription.trial_end
                    ? new Date(subscription.trial_end * 1000)
                    : null,
            },
        });
        this.logger.log(`Subscription updated for organization ${organization.id}: ${status}`);
    }
    async handleSubscriptionDeleted(subscription) {
        const organization = await this.prisma.organization.findFirst({
            where: { subscriptionId: subscription.id },
        });
        if (!organization)
            return;
        await this.prisma.organization.update({
            where: { id: organization.id },
            data: {
                subscriptionStatus: client_1.SubscriptionStatus.CANCELED,
                subscriptionId: null,
            },
        });
        this.logger.log(`Subscription canceled for organization ${organization.id}`);
    }
    async handlePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const organization = await this.prisma.organization.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!organization)
            return;
        await this.prisma.organization.update({
            where: { id: organization.id },
            data: { subscriptionStatus: client_1.SubscriptionStatus.PAST_DUE },
        });
        this.logger.log(`Payment failed for organization ${organization.id}`);
    }
    async getSubscriptionStatus(organizationId) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            throw new common_1.BadRequestException('Organization not found');
        }
        return {
            status: organization.subscriptionStatus,
            trialEndsAt: organization.trialEndsAt,
            isActive: organization.subscriptionStatus === client_1.SubscriptionStatus.TRIAL ||
                organization.subscriptionStatus === client_1.SubscriptionStatus.ACTIVE,
        };
    }
    getPlans() {
        return this.PLANS;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map