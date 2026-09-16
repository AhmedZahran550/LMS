import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module';
import { CoursesModule } from '../../modules/courses/courses.module';
import { UniversitiesModule } from '../../modules/universities/universities.module';
import { CategoriesModule } from '../../modules/categories/categories.module';
import { StorageModule } from '../../modules/storage/storage.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    CoursesModule,
    UniversitiesModule,
    CategoriesModule,
    StorageModule,
    NotificationsModule,
  ],
})
export class AdminApiModule {}
