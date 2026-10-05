import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../../db/entities/course.entity';
import { User } from '../../db/entities/user.entity';
import { CourseContent } from '../../db/entities/course-content.entity';
import { PublicCoursesService } from './public-courses.service';
import { PublicCoursesController } from './public-courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, CourseContent])],
  controllers: [PublicCoursesController],
  providers: [PublicCoursesService],
  exports: [PublicCoursesService],
})
export class PublicCoursesModule {}
