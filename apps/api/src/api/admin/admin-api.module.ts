import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module';
import { CoursesModule } from '../../modules/courses/courses.module';
import { EnrollmentsModule } from '../../modules/enrollments/enrollments.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
})
export class AdminApiModule {}

