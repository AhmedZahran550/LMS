import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadSession } from '../../db/entities/upload-session.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { StorageModule } from '../storage/storage.module';
import { CoursesModule } from '../courses/courses.module';

import { UploadCleanupService } from './upload-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadSession]),
    StorageModule,
    CoursesModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadCleanupService],
  exports: [UploadService],
})
export class UploadModule {}
