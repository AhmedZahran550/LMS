import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  PaginateQuery,
  PaginateConfig,
  FilterOperator,
} from 'nestjs-paginate';
import { Course } from '../../db/entities/course.entity';
import { User } from '../../db/entities/user.entity';
import { CourseContent } from '../../db/entities/course-content.entity';
import { UserRole } from '@lms/shared-types';

export const PUBLIC_COURSE_PAGINATION_CONFIG: PaginateConfig<Course> = {
  sortableColumns: ['createdAt', 'title', 'price'],
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: [
    'title',
    'description',
    'instructor.firstName',
    'instructor.lastName',
  ],
  filterableColumns: {
    categoryId: [FilterOperator.EQ],
    instructorId: [FilterOperator.EQ],
  },
  relations: ['instructor', 'category'],
  select: [
    'id',
    'title',
    'description',
    'price',
    'currency',
    'thumbnailUrl',
    'createdAt',
    'categoryId',
    'category.id',
    'category.name',
    'category.nameAr',
    'category.slug',
    'instructor.id',
    'instructor.firstName',
    'instructor.lastName',
    'instructor.profileImageUrl',
    'instructor.faculty',
    'instructor.department',
  ],
};

export const PUBLIC_INSTRUCTOR_PAGINATION_CONFIG: PaginateConfig<User> = {
  sortableColumns: ['createdAt', 'firstName', 'lastName'],
  nullSort: 'last',
  defaultSortBy: [['firstName', 'ASC']],
  searchableColumns: ['firstName', 'lastName'],
  filterableColumns: {
    universityId: [FilterOperator.EQ],
  },
  relations: ['university'],
  select: [
    'id',
    'firstName',
    'lastName',
    'profileImageUrl',
    'faculty',
    'department',
    'university.id',
    'university.name',
    'university.nameAr',
  ],
};

@Injectable()
export class PublicCoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
  ) {}

  async findAllCourses(query: PaginateQuery) {
    const qb = this.courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.isActive = :isActive', { isActive: true });

    return paginate(query, qb, PUBLIC_COURSE_PAGINATION_CONFIG);
  }

  async findCourseById(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id, isActive: true },
      relations: ['instructor', 'category', 'instructor.university'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only fetch preview contents for unauthenticated / public viewing
    const previewContents = await this.contentRepository.find({
      where: { courseId: id, isPreview: true },
      order: { orderIndex: 'ASC' },
      select: [
        'id',
        'title',
        'description',
        'url',
        'filename',
        'contentType',
        'duration',
        'size',
        'orderIndex',
        'isPreview',
        'createdAt',
      ],
    });

    const totalLessons = await this.contentRepository.count({
      where: { courseId: id },
    });

    const instructorSafe = course.instructor
      ? {
          id: course.instructor.id,
          firstName: course.instructor.firstName,
          lastName: course.instructor.lastName,
          profileImageUrl: course.instructor.profileImageUrl,
          faculty: course.instructor.faculty,
          department: course.instructor.department,
          university: course.instructor.university,
        }
      : null;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: Number(course.price),
      currency: course.currency,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
      category: course.category,
      instructor: instructorSafe,
      previewContents,
      totalLessons,
    };
  }

  async findAllInstructors(query: PaginateQuery) {
    const qb = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.university', 'university')
      .where('user.role = :role', { role: UserRole.INSTRUCTOR })
      .andWhere('user.isActive = :isActive', { isActive: true });

    return paginate(query, qb, PUBLIC_INSTRUCTOR_PAGINATION_CONFIG);
  }

  async findInstructorById(id: string) {
    const instructor = await this.userRepository.findOne({
      where: { id, role: UserRole.INSTRUCTOR, isActive: true },
      relations: ['university'],
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const courses = await this.courseRepository.find({
      where: { instructorId: id, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return {
      id: instructor.id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      profileImageUrl: instructor.profileImageUrl,
      faculty: instructor.faculty,
      department: instructor.department,
      university: instructor.university,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        price: Number(c.price),
        currency: c.currency,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        createdAt: c.createdAt,
      })),
    };
  }
}
