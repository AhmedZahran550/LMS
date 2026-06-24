import { Controller, Get, Patch, Param, Delete, UseGuards, Query, Body } from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';

@Controller('courses') // Bound by RouterModule to /api/admin/courses
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await this.coursesService.findAll(skip, limitNum);

    const result: Omit<PaginatedResponse<any>, 'success' | 'message'> = {
      data: courses.map(c => {
         if (c.instructor) {
             const { password, hashedRefreshToken, ...safeUser } = c.instructor;
             c.instructor = safeUser as any;
         }
         return c;
      }),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return { id, deleted: true };
  }
}
