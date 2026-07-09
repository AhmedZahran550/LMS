import {  Controller, Get, Patch, Param, UseGuards, Post , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from '../notifications.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { NotificationsSwagger } from '../../../swagger/notifications.swagger';

@ApiTags("Notifications")
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class LearnerNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @NotificationsSwagger.findAll()
  async findAll(@CurrentUser() user: any) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Patch(':id/read')
  @NotificationsSwagger.markAsRead()
  async markAsRead(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  @NotificationsSwagger.markAllAsRead()
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }
}
