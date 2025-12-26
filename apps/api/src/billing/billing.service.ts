import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  readonly PLANS = {
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

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
    }
  }

  async createCheckoutSession(
    organizationId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    // Billing is temporarily disabled - purchases are handled manually
    throw new BadRequestException(
      'O checkout online esta temporariamente desabilitado. Entre em contato para contratar: contato@glimora.com.br',
    );

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
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

  async createPortalSession(organizationId: string, returnUrl: string) {
    // Billing is temporarily disabled - purchases are handled manually
    throw new BadRequestException(
      'O portal de billing esta temporariamente desabilitado. Entre em contato: contato@glimora.com.br',
    );

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeCustomerId) {
      throw new BadRequestException('No billing account found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Webhook signature verification failed: ${errorMessage}`,
      );
      throw new BadRequestException('Webhook signature verification failed');
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

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const organizationId = session.metadata?.organizationId;
    if (!organizationId) return;

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionId: session.subscription as string,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(`Checkout completed for organization ${organizationId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const organization = await this.prisma.organization.findFirst({
      where: { subscriptionId: subscription.id },
    });

    if (!organization) return;

    let status: SubscriptionStatus;
    switch (subscription.status) {
      case 'trialing':
        status = SubscriptionStatus.TRIAL;
        break;
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'past_due':
        status = SubscriptionStatus.PAST_DUE;
        break;
      case 'canceled':
        status = SubscriptionStatus.CANCELED;
        break;
      default:
        status = SubscriptionStatus.EXPIRED;
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

    this.logger.log(
      `Subscription updated for organization ${organization.id}: ${status}`,
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const organization = await this.prisma.organization.findFirst({
      where: { subscriptionId: subscription.id },
    });

    if (!organization) return;

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionId: null,
      },
    });

    this.logger.log(
      `Subscription canceled for organization ${organization.id}`,
    );
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const organization = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!organization) return;

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
    });

    this.logger.log(`Payment failed for organization ${organization.id}`);
  }

  async getSubscriptionStatus(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    return {
      status: organization.subscriptionStatus,
      trialEndsAt: organization.trialEndsAt,
      isActive:
        organization.subscriptionStatus === SubscriptionStatus.TRIAL ||
        organization.subscriptionStatus === SubscriptionStatus.ACTIVE,
    };
  }

  getPlans() {
    return this.PLANS;
  }
}
