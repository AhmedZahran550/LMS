import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateConfig, FilterOperator } from 'nestjs-paginate';
import { DBService } from '../../core/base/db.service';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CoursesService } from '../courses/courses.service';
import { StorageService } from '../storage/storage.service';
import { ReorderVideosDto } from './dto/reorder-videos.dto';

export const VIDEO_PAGINATION_CONFIG: PaginateConfig<Video> = {
  sortableColumns: ['createdAt', 'orderIndex', 'title'],
  nullSort: 'last',
  defaultSortBy: [['orderIndex', 'ASC']],
  searchableColumns: ['title', 'description'],
  filterableColumns: {
    courseId: [FilterOperator.EQ],
  },
};

@Injectable()
export class VideosService extends DBService<Video, CreateVideoDto, UpdateVideoDto> {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
    private readonly coursesService: CoursesService,
    private readonly storageService: StorageService,
  ) {
    super(videosRepository, VIDEO_PAGINATION_CONFIG);
  }

  async upload(courseId: string, instructorId: string, createVideoDto: CreateVideoDto, file: Express.Multer.File): Promise<Video> {
    // Verify course ownership
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    // Determine next orderIndex
    const lastVideo = await this.videosRepository.findOne({
      where: { courseId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastVideo ? lastVideo.orderIndex + 1 : 0;

    // Upload file
    const uploadResult = await this.storageService.upload(file, `courses/${courseId}`);

    const video = this.videosRepository.create({
      ...createVideoDto,
      courseId,
      url: uploadResult.url,
      filename: uploadResult.filename,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      orderIndex,
    });

    return this.videosRepository.save(video);
  }

  async findCourseVideos(courseId: string): Promise<Video[]> {
    return this.videosRepository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findCourseVideoById(courseId: string, videoId: string): Promise<Video> {
    const video = await this.videosRepository.findOne({ where: { id: videoId, courseId } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${videoId} not found in this course`);
    }
    return video;
  }

  async updateCourseVideo(courseId: string, videoId: string, instructorId: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const video = await this.findCourseVideoById(courseId, videoId);
    Object.assign(video, updateVideoDto);
    
    return this.videosRepository.save(video);
  }

  async removeCourseVideo(courseId: string, videoId: string, instructorId: string): Promise<void> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const video = await this.findCourseVideoById(courseId, videoId);
    
    // Delete physical file
    await this.storageService.delete(video.filename);
    
    await this.videosRepository.remove(video);
  }

  async reorder(courseId: string, instructorId: string, reorderDto: ReorderVideosDto): Promise<Video[]> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);
    
    const videos = await this.findCourseVideos(courseId);
    
    // Verify all IDs match
    if (videos.length !== reorderDto.videoIds.length) {
      throw new BadRequestException('Must provide all video IDs to reorder');
    }

    const videoMap = new Map(videos.map(v => [v.id, v]));
    
    const updatedVideos = reorderDto.videoIds.map((id, index) => {
      const video = videoMap.get(id);
      if (!video) throw new BadRequestException(`Video ID ${id} is invalid`);
      video.orderIndex = index;
      return video;
    });

    await this.videosRepository.save(updatedVideos);
    return updatedVideos;
  }
}
