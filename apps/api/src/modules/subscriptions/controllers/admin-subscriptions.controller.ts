import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, SubscriptionStatus } from '@lms/shared-types';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  async getAll() {
    return this.subscriptionService.getAllSubscriptions();
  }

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getAllActivePlans();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubscriptionStatus,
  ) {
    return this.subscriptionService.updateSubscriptionStatus(id, status);
  }
}
