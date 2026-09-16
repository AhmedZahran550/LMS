import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../db/entities/category.entity';
import { CategoriesService } from './categories.service';
import { PublicCategoriesController } from './controllers/public-categories.controller';
import { AdminCategoriesController } from './controllers/admin-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [PublicCategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
