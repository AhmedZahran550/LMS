import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursesService } from '../courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';
import { CoursesSwagger } from '../../../swagger/courses.swagger';

@ApiTags("Instructor Courses")
@Controller('instructor/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @CoursesSwagger.createCourse()
  async create(@CurrentUser() user: any, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto, { instructorId: user.id });
  }

  @Get()
  @CoursesSwagger.findAllCourses()
  async findAll(
    @CurrentUser() user: any,
    @Paginate() query: PaginateQuery
  ) {
    return this.coursesService.findAll({
      ...query,
      where: { instructorId: user.id }
    });
  }

  @Get('stats/dashboard')
  @CoursesSwagger.getDashboardStats()
  async getDashboardStats(@CurrentUser() user: any) {
    return this.coursesService.getDashboardStats(user.id);
  }

  @Get(':id')
  @CoursesSwagger.findOneCourse()
  async findOne(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findInstructorCourse(id, user.id);
  }

  @Patch(':id')
  @CoursesSwagger.updateCourse()
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  @Delete(':id')
  @CoursesSwagger.removeCourse()
  async remove(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.coursesService.remove(id, user.id);
    return { id, deleted: true };
  }
}
