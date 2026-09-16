import { Module } from '@nestjs/common';
import { CoursesModule } from '../../modules/courses/courses.module';
import { ContentModule } from '../../modules/videos/videos.module';
import { CoursePurchasesModule } from '../../modules/course-purchases/course-purchases.module';
import { StorageModule } from '../../modules/storage/storage.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [
    CoursesModule,
    ContentModule,
    CoursePurchasesModule,
    StorageModule,
    NotificationsModule,
  ],
})
export class InstructorApiModule {}
