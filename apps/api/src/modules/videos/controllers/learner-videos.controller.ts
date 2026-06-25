import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { CourseContentService } from '../videos.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';

@Controller('learner/my-courses/:courseId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerContentController {
  constructor(private readonly contentService: CourseContentService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.contentService.findLearnerPaginatedCourseContents(courseId, user.id, query);
  }

  @Get(':contentId')
  async findOne(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.contentService.findCourseContentById(courseId, contentId, user.id);
  }
}
