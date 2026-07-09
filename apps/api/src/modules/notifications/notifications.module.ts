import { Module } from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { LearnerNotificationsController } from './controllers/learner-notifications.controller';
import { Notification } from '../../db/entities/notification.entity';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';

@Module({
  imports: [PushNotificationsModule],
  controllers: [LearnerNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
