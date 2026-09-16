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
import { UniversitiesService } from '../universities.service';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { UpdateUniversityDto } from '../dto/update-university.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';
import { UniversitiesSwagger } from '../../../swagger';

@ApiTags('Admin Universities')
@Controller('admin/universities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  @UniversitiesSwagger.create()
  async create(@Body() createDto: CreateUniversityDto) {
    return this.universitiesService.create(createDto);
  }

  @Get()
  @UniversitiesSwagger.findAllAdmin()
  async findAll(@Paginate() query: PaginateQuery) {
    return this.universitiesService.findAll(query);
  }

  @Get(':id')
  @UniversitiesSwagger.findOneAdmin()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.universitiesService.findByIdOrFail(id);
  }

  @Patch(':id')
  @UniversitiesSwagger.updateAdmin()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @UniversitiesSwagger.removeAdmin()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.universitiesService.remove(id);
    return { id, deleted: true };
  }
}
