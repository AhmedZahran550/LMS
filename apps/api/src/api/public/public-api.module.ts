import { Module } from '@nestjs/common';
import { UniversitiesModule } from '../../modules/universities/universities.module';
import { CategoriesModule } from '../../modules/categories/categories.module';
import { PublicCoursesModule } from '../../modules/public-courses/public-courses.module';

@Module({
  imports: [
    UniversitiesModule,
    CategoriesModule,
    PublicCoursesModule,
  ],
})
export class PublicApiModule {}
