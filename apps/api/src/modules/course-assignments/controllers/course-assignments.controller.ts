import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { CourseAssignmentsService } from '../services/course-assignments.service';
import { AssignCourseDto } from '../../instructor-students/dto/assign-course.dto';
import { CourseAssignmentsSwagger } from '../../../swagger/course-assignments.swagger';
import { UserRole } from '@lms/shared-types';

@Controller('instructor/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class CourseAssignmentsController {
  constructor(private readonly service: CourseAssignmentsService) {}

  @Post(':studentId/assign')
  @CourseAssignmentsSwagger.assign()
  async assign(
    @CurrentUser('id') instructorId: string,
    @Param('studentId') studentId: string,
    @Body() dto: AssignCourseDto,
  ) {
    const assignments = await this.service.assign(instructorId, studentId, dto.courseIds);
    return { success: true, data: { assignments } };
  }

  @Get(':studentId/assignments')
  @CourseAssignmentsSwagger.getAssignments()
  async getAssignments(
    @CurrentUser('id') instructorId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.service.getAssignments(instructorId, studentId);
  }
}
