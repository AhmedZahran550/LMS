import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { InstructorVideosController } from './controllers/instructor-videos.controller';
import { LearnerVideosController } from './controllers/learner-videos.controller';
import { Video } from './entities/video.entity';
import { CoursesModule } from '../courses/courses.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    CoursesModule,
    StorageModule,
  ],
  controllers: [InstructorVideosController, LearnerVideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
