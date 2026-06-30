import { Module } from '@nestjs/common';
import { CoursesModule } from '../../modules/courses/courses.module';
import { ContentModule } from '../../modules/videos/videos.module';
import { EnrollmentsModule } from '../../modules/enrollments/enrollments.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { InstructorStudentsModule } from '../../modules/instructor-students/instructor-students.module';

@Module({
  imports: [
    CoursesModule,
    ContentModule,
    EnrollmentsModule,
    NotificationsModule,
    InstructorStudentsModule,
  ],
})
export class LearnerApiModule {}
