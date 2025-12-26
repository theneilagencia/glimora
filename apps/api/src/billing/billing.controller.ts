import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BillingService } from './billing.service';
import {
  CreateCheckoutSessionDto,
  CreatePortalSessionDto,
} from './dto/create-subscription.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Create checkout session' })
  createCheckoutSession(
    @CurrentUser() user: User,
    @Body() createDto: CreateCheckoutSessionDto,
  ) {
    const successUrl =
      createDto.successUrl || `${process.env.FRONTEND_URL}/billing/success`;
    const cancelUrl =
      createDto.cancelUrl || `${process.env.FRONTEND_URL}/billing/cancel`;

    return this.billingService.createCheckoutSession(
      user.organizationId,
      createDto.priceId,
      successUrl,
      cancelUrl,
    );
  }

  @Post('portal')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Create billing portal session' })
  createPortalSession(
    @CurrentUser() user: User,
    @Body() createDto: CreatePortalSessionDto,
  ) {
    const returnUrl =
      createDto.returnUrl || `${process.env.FRONTEND_URL}/settings/billing`;
    return this.billingService.createPortalSession(
      user.organizationId,
      returnUrl,
    );
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get subscription status' })
  getSubscriptionStatus(@CurrentUser() user: User) {
    return this.billingService.getSubscriptionStatus(user.organizationId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.billingService.handleWebhook(signature, req.rawBody as Buffer);
  }
}
