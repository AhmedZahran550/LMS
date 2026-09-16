import { Controller, Get, Param, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UniversitiesService } from '../universities.service';

@ApiTags('Public Universities')
@Controller('public/universities')
export class PublicUniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active universities with full academic hierarchy' })
  async findAll() {
    return this.universitiesService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single university details with faculties, departments, and years' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const university = await this.universitiesService.findActiveById(id);
    if (!university) {
      throw new NotFoundException('University not found');
    }
    return university;
  }
}
