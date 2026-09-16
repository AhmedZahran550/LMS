import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StorageQuotaGuardService } from '../services/storage-quota-guard.service';
import { StorageSubscriptionsService } from '../services/storage-subscriptions.service';
import { SubscribeStoragePlanDto } from '../dto/storage-plan.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';

@ApiTags('Instructor Storage')
@Controller('instructor/storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorStorageController {
  constructor(
    private readonly quotaGuard: StorageQuotaGuardService,
    private readonly subscriptionsService: StorageSubscriptionsService,
  ) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get instructor storage quota breakdown (5GB free base + active subscriptions + used bytes)' })
  async getStorageUsage(@CurrentUser() user: any) {
    const usage = await this.quotaGuard.getStorageUsage(user.id);
    const activeSubscriptions = await this.subscriptionsService.getInstructorActiveSubscriptions(user.id);

    return {
      totalStorageBytes: Number(usage.totalStorageBytes),
      baseStorageBytes: Number(usage.baseStorageBytes),
      activeSubscriptionBytes: Number(usage.activeSubscriptionBytes),
      addonStorageBytes: Number(usage.addonStorageBytes),
      effectiveStorageBytes: Number(usage.effectiveStorageBytes),
      percentageUsed: usage.percentageUsed,
      activeSubscriptions: activeSubscriptions.map((s) => ({
        id: s.id,
        planName: s.storagePlan?.name,
        gigabytes: s.storagePlan?.gigabytes,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status,
      })),
    };
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all purchasable 3-month storage expansion tiers' })
  async getPlans() {
    return this.subscriptionsService.getActivePlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Initiate a 3-month storage plan expansion via Kashier' })
  async subscribe(
    @CurrentUser() user: any,
    @Body() dto: SubscribeStoragePlanDto,
  ) {
    return this.subscriptionsService.initiateSubscription(user.id, dto.planId);
  }
}
