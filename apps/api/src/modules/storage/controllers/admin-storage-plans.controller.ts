import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StorageSubscriptionsService } from '../services/storage-subscriptions.service';
import {
  CreateStoragePlanDto,
  UpdateStoragePlanDto,
} from '../dto/storage-plan.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';

@ApiTags('Admin Storage Plans')
@Controller('admin/storage-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminStoragePlansController {
  constructor(private readonly subscriptionsService: StorageSubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new 3-month storage expansion plan' })
  async create(@Body() dto: CreateStoragePlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all storage plans' })
  async findAll() {
    return this.subscriptionsService.getAllPlans();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get storage plan by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update storage plan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoragePlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete storage plan' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.subscriptionsService.removePlan(id);
    return { id, deleted: true };
  }
}
