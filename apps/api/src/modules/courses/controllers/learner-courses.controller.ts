import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
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
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await this.coursesService.findPublic(skip, limitNum, search);

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
