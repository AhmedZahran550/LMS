import { Controller, Get, Patch, Param, UseGuards, Post } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';

@Controller('notifications') // Bound by RouterModule to /api/learner/notifications and can be used by others too
@UseGuards(JwtAuthGuard)
export class LearnerNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }
}
