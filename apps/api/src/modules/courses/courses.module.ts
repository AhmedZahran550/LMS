import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { InstructorCoursesController } from './controllers/instructor-courses.controller';
import { LearnerCoursesController } from './controllers/learner-courses.controller';
import { Course } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  controllers: [
    AdminCoursesController,
    InstructorCoursesController,
    LearnerCoursesController,
  ],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
