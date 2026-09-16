import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateConfig, FilterOperator } from 'nestjs-paginate';
import { DBService } from '../../db/db.service';
import { Category } from '../../db/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export const CATEGORY_PAGINATION_CONFIG: PaginateConfig<Category> = {
  sortableColumns: ['createdAt', 'name', 'nameAr'],
  nullSort: 'last',
  defaultSortBy: [['name', 'ASC']],
  searchableColumns: ['name', 'nameAr', 'slug'],
  filterableColumns: {
    isActive: [FilterOperator.EQ],
  },
};

@Injectable()
export class CategoriesService extends DBService<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    super(categoryRepository, CATEGORY_PAGINATION_CONFIG);
  }

  async findAllActive(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { slug, isActive: true },
    });
  }
}
