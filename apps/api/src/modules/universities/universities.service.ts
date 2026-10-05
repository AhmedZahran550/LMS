import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateConfig, FilterOperator } from 'nestjs-paginate';
import { DBService } from '../../db/db.service';
import { University } from '../../db/entities/university.entity';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

export const UNIVERSITY_PAGINATION_CONFIG: PaginateConfig<University> = {
  sortableColumns: ['createdAt', 'name', 'nameAr'],
  nullSort: 'last',
  defaultSortBy: [['name', 'ASC']],
  searchableColumns: ['name', 'nameAr'],
  filterableColumns: {
    isActive: [FilterOperator.EQ],
  },
};

@Injectable()
export class UniversitiesService extends DBService<
  University,
  CreateUniversityDto,
  UpdateUniversityDto
> {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
  ) {
    super(universityRepository, UNIVERSITY_PAGINATION_CONFIG);
  }

  async findAllActive(): Promise<University[]> {
    return this.universityRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findActiveById(id: string): Promise<University | null> {
    return this.universityRepository.findOne({
      where: { id, isActive: true },
    });
  }
}
