import {
  Controller, Get, Post, Param, Query, UseGuards, Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { InstructorStudentsService } from '../services/instructor-students.service';
import { InstructorStudentsSwagger } from '../../../swagger/instructor-students.swagger';
import { UserRole } from '@lms/shared-types';

@Controller('learner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class StudentInstructorsController {
  constructor(private readonly service: InstructorStudentsService) {}

  @Get('instructors')
  @InstructorStudentsSwagger.searchInstructors()
  async searchInstructors(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.searchInstructors(query, +page, +limit);
  }

  @Post('instructors/:instructorId/join')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @InstructorStudentsSwagger.requestToJoin()
  async requestToJoin(
    @CurrentUser('id') studentId: string,
    @Param('instructorId') instructorId: string,
  ) {
    const link = await this.service.requestToJoin(studentId, instructorId);
    return { success: true, data: { id: link.id, status: link.status } };
  }

  @Get('my-instructors')
  @InstructorStudentsSwagger.myInstructors()
  async myInstructors(@CurrentUser('id') studentId: string) {
    const instructors = await this.service.getMyInstructors(studentId);
    return { success: true, data: instructors };
  }

  @Get('my-instructors/:instructorId/courses')
  async getInstructorCourses(
    @CurrentUser('id') studentId: string,
    @Param('instructorId') instructorId: string,
  ) {
    const courses = await this.service.getInstructorCourses(studentId, instructorId);
    return { success: true, data: courses };
  }
}
