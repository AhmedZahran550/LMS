import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import { StripeService } from '../services/stripe.service';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole, SubscriptionPlanType } from '@lms/shared-types';
import { Request } from 'express';
import { SubscriptionsSwagger } from '../../../swagger/subscriptions.swagger';

@ApiTags("Instructor Subscriptions")
@Controller('instructor/subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorSubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @SubscriptionsSwagger.getMySubscription()
  async getMySubscription(@CurrentUser() user: any) {
    const usage = await this.subscriptionService.getUsage(user.id);
    return usage;
  }

  @Get('plans')
  @SubscriptionsSwagger.getPlans()
  async getPlans() {
    return this.subscriptionService.getAllActivePlans();
  }

  @Post('checkout')
  @SubscriptionsSwagger.createCheckout()
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
  @SubscriptionsSwagger.createPortal()
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

  @Post('choose-plan')
  @SubscriptionsSwagger.choosePlan()
  async choosePlan(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    const planType = dto.planType;

    if (planType === SubscriptionPlanType.FREE) {
      const subscription = await this.subscriptionService.createSubscription(
        user.id,
        planType,
      );
      const plan = subscription.plan;
      return {
        plan: plan?.name || null,
        status: subscription.status,
        coursesCount: 0,
        totalStudents: 0,
        totalStorageBytes: 0,
        maxCourses: plan?.maxCourses || 0,
        maxStudentsPerCourse: plan?.maxStudentsPerCourse || 0,
        maxStorageBytes: plan?.maxStorageBytes || 0,
      };
    }

    // Pro/Plus → redirect to Stripe checkout
    const priceId = await this.subscriptionService.getStripePriceId(planType);

    const frontendUrl = process.env.FRONTEND_URL || process.env.WEB_URL || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${frontendUrl}/choose-plan?success=true`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/choose-plan`;

    const session = await this.stripeService.createCheckoutSession(
      user.id,
      user.email,
      priceId,
      successUrl,
      cancelUrl,
    );

    return { url: session.url };
  }

  @Post('refresh-subscription')
  @SubscriptionsSwagger.refreshSubscription()
  async refreshSubscription(@CurrentUser() user: any) {
    const usage = await this.subscriptionService.getUsage(user.id);
    if (!usage) {
      return {
        plan: null,
        status: null,
        coursesCount: 0,
        totalStudents: 0,
        totalStorageBytes: 0,
        maxCourses: 0,
        maxStudentsPerCourse: 0,
        maxStorageBytes: 0,
      };
    }
    return {
      plan: usage.plan?.name || null,
      status: usage.subscription?.status || null,
      coursesCount: usage.coursesCount,
      totalStudents: usage.totalStudents,
      totalStorageBytes: usage.totalStorageBytes,
      maxCourses: usage.plan?.maxCourses || 0,
      maxStudentsPerCourse: usage.plan?.maxStudentsPerCourse || 0,
      maxStorageBytes: usage.plan?.maxStorageBytes || 0,
    };
  }

  @Post('cancel')
  @SubscriptionsSwagger.cancelSubscription()
  async cancel(@CurrentUser() user: any) {
    await this.subscriptionService.cancelSubscription(user.id);
    return { message: 'Subscription cancelled successfully' };
  }
}
