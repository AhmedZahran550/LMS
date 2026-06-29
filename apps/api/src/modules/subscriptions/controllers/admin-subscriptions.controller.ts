import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, SubscriptionStatus } from '@lms/shared-types';
import { SubscriptionsSwagger } from '../../../swagger/subscriptions.swagger';

@ApiTags("Admin Subscriptions")
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  @SubscriptionsSwagger.getAllSubscriptions()
  async getAll() {
    return this.subscriptionService.getAllSubscriptions();
  }

  @Get('plans')
  @SubscriptionsSwagger.getAllPlans()
  async getPlans() {
    return this.subscriptionService.getAllActivePlans();
  }

  @Patch(':id/status')
  @SubscriptionsSwagger.updateSubscriptionStatus()
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubscriptionStatus,
  ) {
    return this.subscriptionService.updateSubscriptionStatus(id, status);
  }
}
