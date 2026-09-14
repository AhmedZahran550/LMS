import {  Controller, Get, Post, Param, UseGuards, ForbiddenException , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { EnrollmentsService } from '../enrollments.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { CoursesService } from '../../courses/courses.service';
import { CourseContentService } from '../../videos/videos.service';
import { EnrollmentsSwagger } from '../../../swagger/enrollments.swagger';

@ApiTags("Learner Enrollments")
@Controller('learner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerEnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly coursesService: CoursesService,
    private readonly contentService: CourseContentService,
  ) {}

  @Post('courses/:courseId/enroll')
  @EnrollmentsSwagger.requestEnrollment()
  async requestEnrollment(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.enrollmentsService.requestEnrollment(user.id, courseId);
  }

  @Get('my-courses')
  @EnrollmentsSwagger.getMyCourses()
  async getMyCourses(
    @CurrentUser() user: any,
    @Paginate() query: PaginateQuery,
  ) {
    return this.enrollmentsService.getLearnerEnrollments(user.id, query);
  }

  @Get('my-courses/:courseId')
  @EnrollmentsSwagger.getMyCourseDetail()
  async getMyCourseDetail(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const isEnrolled = await this.enrollmentsService.isEnrolled(user.id, courseId);
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const course = await this.coursesService.findById(courseId);
    const contents = await this.contentService.findCourseContents(courseId);
    
    if (course.instructor) {
        const { password, hashedRefreshToken, ...safeUser } = course.instructor;
        course.instructor = safeUser as any;
    }

    return { ...course, contents };
  }
}
