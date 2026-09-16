import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from '../categories.service';

@ApiTags('Public Categories')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active course categories' })
  async findAll() {
    return this.categoriesService.findAllActive();
  }
}
