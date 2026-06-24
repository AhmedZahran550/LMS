import { Module } from '@nestjs/common';
import { CoursesModule } from '../../modules/courses/courses.module';
import { VideosModule } from '../../modules/videos/videos.module';
import { EnrollmentsModule } from '../../modules/enrollments/enrollments.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [
    CoursesModule,
    VideosModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
})
export class LearnerApiModule {}
