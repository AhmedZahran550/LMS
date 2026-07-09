import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { AdminUsersController } from './controllers/admin-users.controller';
import { ProfileController } from './controllers/profile.controller';
import { LearnerInstructorsController } from './controllers/learner-instructors.controller';
import { User } from '../../db/entities/user.entity';
import { StorageModule } from '../storage/storage.module';

import { PushNotificationsModule } from '../push-notifications/push-notifications.module';

@Module({
  imports: [
    PushNotificationsModule,
    StorageModule,
  ],
  controllers: [AdminUsersController, ProfileController, LearnerInstructorsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
