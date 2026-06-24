import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursesService } from '../courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';

@Controller('instructor/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto, { instructorId: user.id });
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Paginate() query: PaginateQuery
  ) {
    return this.coursesService.findAll(query, {
      where: { instructorId: user.id }
    });
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.coursesService.findInstructorCourse(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.coursesService.remove(id, user.id);
    return { id, deleted: true };
  }
}
