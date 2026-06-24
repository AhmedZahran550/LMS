import { Controller, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from '../videos.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { ReorderVideosDto } from '../dto/reorder-videos.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';

@Controller('instructor/courses/:courseId/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorVideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Notify enrollees can be triggered here via an event
    return this.videosService.upload(courseId, user.id, createVideoDto, file);
  }

  @Patch('reorder')
  async reorder(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() reorderDto: ReorderVideosDto,
  ) {
    return this.videosService.reorder(courseId, user.id, reorderDto);
  }

  @Patch(':videoId')
  async update(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    return this.videosService.update(courseId, videoId, user.id, updateVideoDto);
  }

  @Delete(':videoId')
  async remove(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
  ) {
    await this.videosService.remove(courseId, videoId, user.id);
    return { videoId, deleted: true };
  }
}
