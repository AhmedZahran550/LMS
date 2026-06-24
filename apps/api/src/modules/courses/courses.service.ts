import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseVisibility } from '@lms/shared-types';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(instructorId: string, createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      instructorId,
    });
    return this.coursesRepository.save(course);
  }

  async findAll(skip: number = 0, take: number = 10, instructorId?: string): Promise<[Course[], number]> {
    const where = instructorId ? { instructorId } : {};
    return this.coursesRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['instructor'],
    });
  }

  async findPublic(skip: number = 0, take: number = 10, search?: string): Promise<[Course[], number]> {
    const qb = this.coursesRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.visibility = :visibility', { visibility: CourseVisibility.PUBLIC })
      .andWhere('course.isActive = :isActive', { isActive: true });

    if (search) {
      qb.andWhere('course.title ILIKE :search OR course.description ILIKE :search', { search: `%${search}%` });
    }

    return qb
      .orderBy('course.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async findById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['instructor', 'videos'], // assuming videos will be related
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async findInstructorCourse(id: string, instructorId: string): Promise<Course> {
    const course = await this.findById(id);
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, instructorId?: string): Promise<Course> {
    let course;
    if (instructorId) {
      course = await this.findInstructorCourse(id, instructorId);
    } else {
      course = await this.findById(id);
    }

    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string, instructorId?: string): Promise<void> {
    let course;
    if (instructorId) {
      course = await this.findInstructorCourse(id, instructorId);
    } else {
      course = await this.findById(id);
    }
    await this.coursesRepository.remove(course);
  }
}
