import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAssignment } from '../../db/entities/course-assignment.entity';
import { CourseAssignmentsService } from './services/course-assignments.service';
import { CourseAssignmentsController } from './controllers/course-assignments.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseAssignment]),
    CoursesModule,
  ],
  controllers: [CourseAssignmentsController],
  providers: [CourseAssignmentsService],
  exports: [CourseAssignmentsService],
})
export class CourseAssignmentsModule {}
