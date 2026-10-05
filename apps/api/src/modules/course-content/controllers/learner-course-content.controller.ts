import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { CourseContentService } from '../course-content.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';
import { CourseContentSwagger } from '../../../swagger/course-content.swagger';

@ApiTags("Learner Content")
@Controller('learner/my-courses/:courseId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerCourseContentController {
  constructor(private readonly contentService: CourseContentService) {}

  @Get()
  @CourseContentSwagger.findAllLearnerContent()
  async findAll(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.contentService.findLearnerPaginatedCourseContents(courseId, user.id, query);
  }

  @Get(':contentId')
  @CourseContentSwagger.findOneLearnerContent()
  async findOne(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    return this.contentService.findCourseContentById(courseId, contentId, user.id);
  }
}

export { LearnerCourseContentController as LearnerContentController };
