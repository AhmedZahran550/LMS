import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { InstructorStudentsService } from '../services/instructor-students.service';
import { InviteStudentDto } from '../dto/invite-student.dto';
import { RespondRequestDto } from '../dto/respond-request.dto';
import { InstructorStudentStatus } from '@lms/shared-types';
import { InstructorStudentsSwagger } from '../../../swagger/instructor-students.swagger';
import { UserRole } from '@lms/shared-types';

@Controller('instructor/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorStudentsController {
  constructor(private readonly service: InstructorStudentsService) {}

  @Post('invite')
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  @InstructorStudentsSwagger.invite()
  async invite(@CurrentUser('id') instructorId: string, @Body() dto: InviteStudentDto) {
    const link = await this.service.invite(instructorId, dto);
    return { success: true, data: { id: link.id, status: link.status } };
  }

  @Get()
  @InstructorStudentsSwagger.listStudents()
  async listStudents(
    @CurrentUser('id') instructorId: string,
    @Query('status') status?: InstructorStudentStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.listStudents(instructorId, status, +page, +limit);
  }

  @Get('requests')
  @InstructorStudentsSwagger.listRequests()
  async listRequests(
    @CurrentUser('id') instructorId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.listRequests(instructorId, +page, +limit);
  }

  @Patch('requests/:id/respond')
  @InstructorStudentsSwagger.respondToRequest()
  async respondToRequest(
    @CurrentUser('id') instructorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondRequestDto,
  ) {
    const link = await this.service.respondToRequest(instructorId, id, dto);
    return { success: true, data: { id: link.id, status: link.status } };
  }

  @Delete(':id')
  @InstructorStudentsSwagger.removeStudent()
  async removeStudent(@CurrentUser('id') instructorId: string, @Param('id', ParseUUIDPipe) id: string) {
    const link = await this.service.removeStudent(instructorId, id);
    return { success: true, data: { id: link.id, status: link.status } };
  }
}
