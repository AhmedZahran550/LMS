import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';
import { PushNotificationService } from '../push-notifications.service';
import { TestPushNotificationDto } from '../dto/test-push-notification.dto';
import { PushNotificationsSwagger } from '../../../swagger';

@ApiTags('Admin Push Notifications')
@Controller('admin/push-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPushNotificationsController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @PushNotificationsSwagger.testPushNotification()
  async testPushNotification(@Body() dto: TestPushNotificationDto) {
    const payload = {
      title: dto.title,
      body: dto.body,
      type: dto.type,
      data: dto.data,
    };
    await this.pushNotificationService.sendToUser(dto.userId, payload);
    return { success: true, message: 'Push notification queued.' };
  }
}
