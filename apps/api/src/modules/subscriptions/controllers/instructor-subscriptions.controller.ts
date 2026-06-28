import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { StripeService } from '../services/stripe.service';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole, SubscriptionPlanType } from '@lms/shared-types';
import { Request } from 'express';

@Controller('instructor/subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorSubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  async getMySubscription(@CurrentUser() user: any) {
    const usage = await this.subscriptionService.getUsage(user.id);
    return usage;
  }

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getAllActivePlans();
  }

  @Post('checkout')
  async createCheckout(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: Request,
  ) {
    const priceId = await this.subscriptionService.getStripePriceId(
      dto.planType,
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const frontendUrl = process.env.FRONTEND_URL || process.env.WEB_URL || 'http://localhost:3000';

    const successUrl = dto.successUrl || `${frontendUrl}/instructor/subscription?success=true`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/instructor/subscription?cancelled=true`;

    const session = await this.stripeService.createCheckoutSession(
      user.id,
      user.email,
      priceId,
      successUrl,
      cancelUrl,
    );

    return { url: session.url };
  }

  @Post('portal')
  async createPortal(
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const subscription = await this.subscriptionService.getActiveSubscription(
      user.id,
    );

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found');
    }

    const frontendUrl = process.env.FRONTEND_URL || process.env.WEB_URL || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/instructor/subscription`;

    const session = await this.stripeService.createPortalSession(
      subscription.stripeCustomerId,
      returnUrl,
    );

    return { url: session.url };
  }

  @Post('cancel')
  async cancel(@CurrentUser() user: any) {
    await this.subscriptionService.cancelSubscription(user.id);
    return { message: 'Subscription cancelled successfully' };
  }
}
