import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseContentService } from './videos.service';
import { InstructorContentController } from './controllers/instructor-videos.controller';
import { LearnerContentController } from './controllers/learner-videos.controller';
import { CourseContent } from './entities/video.entity';
import { CoursesModule } from '../courses/courses.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseContent]),
    CoursesModule,
    StorageModule,
  ],
  controllers: [InstructorContentController, LearnerContentController],
  providers: [CourseContentService],
  exports: [CourseContentService],
})
export class ContentModule {}
