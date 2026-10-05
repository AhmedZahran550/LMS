import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseContentService } from '../course-content.service';
import { CreateCourseContentDto } from '../dto/create-course-content.dto';
import { UpdateCourseContentDto } from '../dto/update-course-content.dto';
import { ReorderCourseContentDto } from '../dto/reorder-course-content.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CourseContentSwagger } from '../../../swagger/course-content.swagger';

@ApiTags("Instructor Content")
@Controller('instructor/courses/:courseId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorCourseContentController {
  constructor(private readonly contentService: CourseContentService) {}

  @Get()
  @CourseContentSwagger.findAllContent()
  async findAll(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.contentService.findPaginatedCourseContents(courseId, user.id, query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @CourseContentSwagger.uploadContent()
  async upload(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createDto: CreateCourseContentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contentService.upload(courseId, user.id, createDto, file);
  }

  @Patch('reorder')
  @CourseContentSwagger.reorderContent()
  async reorder(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() reorderDto: ReorderCourseContentDto,
  ) {
    return this.contentService.reorder(courseId, user.id, reorderDto);
  }

  @Patch(':contentId')
  @CourseContentSwagger.updateContent()
  async update(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Body() updateDto: UpdateCourseContentDto,
  ) {
    return this.contentService.updateCourseContent(courseId, contentId, user.id, updateDto);
  }

  @Delete(':contentId')
  @CourseContentSwagger.removeContent()
  async remove(
    @CurrentUser() user: any,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    await this.contentService.removeCourseContent(courseId, contentId, user.id);
    return { contentId, deleted: true };
  }
}

export { InstructorCourseContentController as InstructorContentController };
