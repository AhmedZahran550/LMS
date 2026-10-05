import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';
import { CategoriesSwagger } from '../../../swagger';

@ApiTags('Admin Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @CategoriesSwagger.create()
  async create(@Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @CategoriesSwagger.findAllAdmin()
  async findAll(@Paginate() query: PaginateQuery) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @CategoriesSwagger.findOneAdmin()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findByIdOrFail(id);
  }

  @Patch(':id')
  @CategoriesSwagger.updateAdmin()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @CategoriesSwagger.removeAdmin()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return { id, deleted: true };
  }
}
