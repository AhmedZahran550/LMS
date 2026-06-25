import { Module, forwardRef } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { InstructorCoursesController } from './controllers/instructor-courses.controller';
import { LearnerCoursesController } from './controllers/learner-courses.controller';
import { Course } from '../../db/entities/course.entity';

@Module({
  imports: [],
  controllers: [
    AdminCoursesController,
    InstructorCoursesController,
    LearnerCoursesController,
  ],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
