import { Module } from '@nestjs/common';
import { CoursesModule } from '../../modules/courses/courses.module';
import { CourseContentModule } from '../../modules/course-content/course-content.module';
import { CoursePurchasesModule } from '../../modules/course-purchases/course-purchases.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [
    CoursesModule,
    CourseContentModule,
    CoursePurchasesModule,
    NotificationsModule,
  ],
})
export class LearnerApiModule {}
