import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseContentService } from '../videos.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { ReorderVideosDto } from '../dto/reorder-videos.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { VideosSwagger } from '../../../swagger/videos.swagger';

@ApiTags("Instructor Content")
@Controller('instructor/courses/:courseId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorContentController {
  constructor(private readonly contentService: CourseContentService) {}

  @Get()
  @VideosSwagger.findAllContent()
  async findAll(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.contentService.findPaginatedCourseContents(courseId, user.id, query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @VideosSwagger.uploadContent()
  async upload(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contentService.upload(courseId, user.id, createDto, file);
  }

  @Patch('reorder')
  @VideosSwagger.reorderContent()
  async reorder(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() reorderDto: ReorderVideosDto,
  ) {
    return this.contentService.reorder(courseId, user.id, reorderDto);
  }

  @Patch(':contentId')
  @VideosSwagger.updateContent()
  async update(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Body() updateDto: UpdateVideoDto,
  ) {
    return this.contentService.updateCourseContent(courseId, contentId, user.id, updateDto);
  }

  @Delete(':contentId')
  @VideosSwagger.removeContent()
  async remove(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    await this.contentService.removeCourseContent(courseId, contentId, user.id);
    return { contentId, deleted: true };
  }
}
