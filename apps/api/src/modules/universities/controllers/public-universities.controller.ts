import { Controller, Get, Param, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UniversitiesService } from '../universities.service';
import { UniversitiesSwagger } from '../../../swagger';

@ApiTags('Public Universities')
@Controller('public/universities')
export class PublicUniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @UniversitiesSwagger.findAllPublic()
  async findAll() {
    return this.universitiesService.findAllActive();
  }

  @Get(':id')
  @UniversitiesSwagger.findOnePublic()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const university = await this.universitiesService.findActiveById(id);
    if (!university) {
      throw new NotFoundException('University not found');
    }
    return university;
  }
}
