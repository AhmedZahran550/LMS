import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateConfig, FilterOperator } from 'nestjs-paginate';
import { DBService } from '../../db/db.service';
import { CourseContent } from '../../db/entities/course-content.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CoursesService } from '../courses/courses.service';
import { StorageService } from '../storage/storage.service';
import { ReorderVideosDto } from './dto/reorder-videos.dto';
import { ContentType } from '@lms/shared-types';

export const CONTENT_PAGINATION_CONFIG: PaginateConfig<CourseContent> = {
  sortableColumns: ['createdAt', 'orderIndex', 'title'],
  nullSort: 'last',
  defaultSortBy: [['orderIndex', 'ASC']],
  searchableColumns: ['title', 'description'],
  filterableColumns: {
    courseId: [FilterOperator.EQ],
    contentType: [FilterOperator.EQ],
  },
};

function inferContentType(mimeType: string): ContentType {
  if (mimeType.startsWith('video/')) return ContentType.VIDEO;
  if (mimeType === 'application/pdf') return ContentType.PDF;
  if (mimeType.startsWith('image/')) return ContentType.IMAGE;
  if (
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return ContentType.PRESENTATION;
  }
  // Default to video for unknown types
  return ContentType.VIDEO;
}

@Injectable()
export class CourseContentService extends DBService<CourseContent, CreateVideoDto, UpdateVideoDto> {
  constructor(
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    private readonly coursesService: CoursesService,
    private readonly storageService: StorageService,
  ) {
    super(contentRepository, CONTENT_PAGINATION_CONFIG);
  }

  async upload(courseId: string, instructorId: string, createDto: CreateVideoDto, file: Express.Multer.File): Promise<CourseContent> {
    // Verify course ownership
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Determine next orderIndex
    const lastContent = await this.contentRepository.findOne({
      where: { courseId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastContent ? lastContent.orderIndex + 1 : 0;

    // Upload file
    const uploadResult = await this.storageService.upload(file, `courses/${courseId}`);

    const contentType = inferContentType(uploadResult.mimeType);

    const content = this.contentRepository.create({
      ...createDto,
      courseId,
      url: uploadResult.url,
      filename: uploadResult.filename,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      orderIndex,
      contentType,
    });

    return this.contentRepository.save(content);
  }

  async findCourseContents(courseId: string): Promise<CourseContent[]> {
    return this.contentRepository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findCourseContentById(courseId: string, contentId: string): Promise<CourseContent> {
    const content = await this.contentRepository.findOne({ where: { id: contentId, courseId } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found in this course`);
    }
    return content;
  }

  async updateCourseContent(courseId: string, contentId: string, instructorId: string, updateDto: UpdateVideoDto): Promise<CourseContent> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const content = await this.findCourseContentById(courseId, contentId);
    Object.assign(content, updateDto);
    
    return this.contentRepository.save(content);
  }

  async removeCourseContent(courseId: string, contentId: string, instructorId: string): Promise<void> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const content = await this.findCourseContentById(courseId, contentId);
    
    // Delete physical file
    await this.storageService.delete(content.filename);
    
    await this.contentRepository.remove(content);
  }

  async reorder(courseId: string, instructorId: string, reorderDto: ReorderVideosDto): Promise<CourseContent[]> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const contents = await this.findCourseContents(courseId);
    
    // Verify all IDs match
    if (contents.length !== reorderDto.videoIds.length) {
      throw new BadRequestException('Must provide all content IDs to reorder');
    }

    const contentMap = new Map(contents.map(c => [c.id, c]));
    
    const updatedContents = reorderDto.videoIds.map((id, index) => {
      const content = contentMap.get(id);
      if (!content) throw new BadRequestException(`Content ID ${id} is invalid`);
      content.orderIndex = index;
      return content;
    });

    await this.contentRepository.save(updatedContents);
    return updatedContents;
  }
}
