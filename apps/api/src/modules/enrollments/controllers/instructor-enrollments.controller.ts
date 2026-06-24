import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments.service';
import { RespondEnrollmentDto } from '../dto/respond-enrollment.dto';
import { InviteLearnerDto } from '../dto/invite-learner.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';

@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('courses/:courseId/enrollments')
  async getCourseEnrollments(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    const enrollments = await this.enrollmentsService.getCourseEnrollments(courseId, user.id);
    return enrollments.map(e => {
      if (e.learner) {
        const { password, hashedRefreshToken, ...safeUser } = e.learner;
        e.learner = safeUser as any;
      }
      return e;
    });
  }

  @Patch('enrollments/:id/respond')
  async respond(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() respondDto: RespondEnrollmentDto,
  ) {
    return this.enrollmentsService.respondToEnrollment(id, user.id, respondDto);
  }

  @Post('courses/:courseId/invite')
  async invite(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() inviteDto: InviteLearnerDto,
  ) {
    return this.enrollmentsService.inviteLearner(courseId, user.id, inviteDto);
  }
}
