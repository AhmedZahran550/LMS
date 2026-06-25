import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  @Get(':contentId')
  async findOne(
    @Param('courseId') courseId: string,
    @Param('contentId') contentId: string,
  ) {
    // Note: Enrollment check should happen here or via a guard to ensure learner is enrolled
    return this.contentService.findCourseContentById(courseId, contentId);
  }
}
