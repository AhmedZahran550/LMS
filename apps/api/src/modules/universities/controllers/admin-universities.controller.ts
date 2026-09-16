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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UniversitiesService } from '../universities.service';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { UpdateUniversityDto } from '../dto/update-university.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';

@ApiTags('Admin Universities')
@Controller('admin/universities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new university with faculties hierarchy' })
  async create(@Body() createDto: CreateUniversityDto) {
    return this.universitiesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Paginated list of universities for admin' })
  async findAll(@Paginate() query: PaginateQuery) {
    return this.universitiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get university by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.universitiesService.findByIdOrFail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update university or its faculties JSONB data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete university' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.universitiesService.remove(id);
    return { id, deleted: true };
  }
}
