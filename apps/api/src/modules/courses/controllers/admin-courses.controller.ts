import { Controller, Get, Patch, Param, Delete, UseGuards, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursesService } from '../courses.service';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';
import { CoursesSwagger } from '../../../swagger/courses.swagger';

@ApiTags("Admin Courses")
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @CoursesSwagger.findAllAdminCourses()
  async findAll(@Paginate() query: PaginateQuery) {
    const result = await this.coursesService.findAll(query);
    
    result.data = result.data.map(c => {
      if (c.instructor) {
        const { password, hashedRefreshToken, ...safeUser } = c.instructor;
        c.instructor = safeUser as any;
      }
      return c;
    });
    return result;
  }

  @Get(':id')
  @CoursesSwagger.findOneAdminCourse()
  async findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Patch(':id')
  @CoursesSwagger.updateAdminCourse()
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @CoursesSwagger.removeAdminCourse()
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return { id, deleted: true };
  }
}
