import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursesService } from '../courses.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';

@Controller('learner/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Paginate() query: PaginateQuery) {
    const result = await this.coursesService.findPublic(query);

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
  async findOne(@Param('id') id: string) {
    const course: any = await this.coursesService.findById(id);
    // Remove videos from public payload unless enrolled (enrolled logic goes to my-courses)
    course.videos = [];
    if (course.instructor) {
        const { password, hashedRefreshToken, ...safeUser } = course.instructor;
        course.instructor = safeUser as any;
    }
    return course;
  }
}
