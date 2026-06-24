import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VideosService } from '../videos.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';

@Controller('learner/my-courses/:courseId/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerVideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get(':videoId')
  async findOne(
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
  ) {
    // Note: Enrollment check should happen here or via a guard to ensure learner is enrolled
    return this.videosService.findCourseVideoById(courseId, videoId);
  }
}
