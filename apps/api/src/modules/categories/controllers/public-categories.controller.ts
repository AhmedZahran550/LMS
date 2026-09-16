import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../categories.service';
import { CategoriesSwagger } from '../../../swagger';

@ApiTags('Public Categories')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @CategoriesSwagger.findAllPublic()
  async findAll() {
    return this.categoriesService.findAllActive();
  }
}
