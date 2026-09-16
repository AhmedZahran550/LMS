import { Module } from '@nestjs/common';
import { CourseContentService } from './course-content.service';
import { InstructorCourseContentController } from './controllers/instructor-course-content.controller';
import { LearnerCourseContentController } from './controllers/learner-course-content.controller';
import { CourseContent } from '../../db/entities/course-content.entity';
import { CoursesModule } from '../courses/courses.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePurchase } from '../../db/entities/course-purchase.entity';
import { User } from '../../db/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseContent, CoursePurchase, User]),
    CoursesModule,
    StorageModule,
    NotificationsModule,
  ],
  controllers: [InstructorCourseContentController, LearnerCourseContentController],
  providers: [CourseContentService],
  exports: [CourseContentService],
})
export class CourseContentModule {}

export { CourseContentModule as ContentModule };
