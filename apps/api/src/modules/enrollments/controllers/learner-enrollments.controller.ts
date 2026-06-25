import { Controller, Get, Post, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { CoursesService } from '../../courses/courses.service';
import { CourseContentService } from '../../videos/videos.service';

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
  async requestEnrollment(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.requestEnrollment(user.id, courseId);
  }

  @Get('my-courses')
  async getMyCourses(@CurrentUser() user: any) {
    const enrollments = await this.enrollmentsService.getLearnerEnrollments(user.id);
    return enrollments.map(e => {
        if (e.course && e.course.instructor) {
            const { password, hashedRefreshToken, ...safeUser } = e.course.instructor;
            e.course.instructor = safeUser as any;
        }
        return e;
    });
  }

  @Get('my-courses/:courseId')
  async getMyCourseDetail(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
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
