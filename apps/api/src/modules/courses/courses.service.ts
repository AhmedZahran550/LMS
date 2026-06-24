import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { PaginateConfig, FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { DBService } from '../../core/base/db.service';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseVisibility, PaginatedResponse } from '@lms/shared-types';

export const COURSE_PAGINATION_CONFIG: PaginateConfig<Course> = {
  sortableColumns: ['createdAt', 'title'],
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['title', 'description'],
  filterableColumns: {
    visibility: [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
    instructorId: [FilterOperator.EQ]
  },
  relations: ['instructor']
};

@Injectable()
export class CoursesService extends DBService<Course, CreateCourseDto, UpdateCourseDto> {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {
    super(coursesRepository, COURSE_PAGINATION_CONFIG);
  }

  async create(createCourseDto: CreateCourseDto, additionalData?: DeepPartial<Course>): Promise<Course> {
    return super.create(createCourseDto, additionalData);
  }

  async findPublic(query: PaginateQuery): Promise<Omit<PaginatedResponse<Course>, 'success' | 'message'>> {
    const qb = this.coursesRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.visibility = :visibility', { visibility: CourseVisibility.PUBLIC })
      .andWhere('course.isActive = :isActive', { isActive: true });

    const result = await paginate(query, qb, COURSE_PAGINATION_CONFIG);
    return {
      data: result.data,
      meta: {
        total: result.meta.totalItems || 0,
        page: result.meta.currentPage || 1,
        limit: result.meta.itemsPerPage || 10,
        totalPages: result.meta.totalPages || 1,
      }
    };
  }

  async findById(id: string): Promise<Course> {
    return super.findById(id, { relations: ['instructor', 'videos'] });
  }

  async findInstructorCourse(id: string, instructorId: string): Promise<Course> {
    const course = await this.findById(id);
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, instructorId?: string): Promise<Course> {
    if (instructorId) {
      await this.findInstructorCourse(id, instructorId);
    }
    return super.update(id, updateCourseDto);
  }

  async remove(id: string, instructorId?: string): Promise<void> {
    if (instructorId) {
      await this.findInstructorCourse(id, instructorId);
    }
    return super.remove(id);
  }
}

