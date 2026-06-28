import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeepPartial } from "typeorm";
import {
  PaginateConfig,
  FilterOperator,
  paginate,
  PaginateQuery,
} from "nestjs-paginate";
import { DBService } from '../../db/db.service';
import { Course } from '../../db/entities/course.entity';
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CourseVisibility, PaginatedResponse, ContentType } from "@lms/shared-types";
import { SubscriptionGuardService } from '../subscriptions/services/subscription-guard.service';

export const COURSE_PAGINATION_CONFIG: PaginateConfig<Course> = {
  sortableColumns: ["createdAt", "title"],
  nullSort: "last",
  defaultSortBy: [["createdAt", "DESC"]],
  searchableColumns: [
    "title",
    "description",
    "instructor.firstName",
    "instructor.lastName",
    "instructor.email",
  ],
  filterableColumns: {
    visibility: [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
    instructorId: [FilterOperator.EQ],
  },
  relations: ["instructor"],
};

@Injectable()
export class CoursesService extends DBService<
  Course,
  CreateCourseDto,
  UpdateCourseDto
> {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    private readonly subscriptionGuard: SubscriptionGuardService,
  ) {
    super(coursesRepository, COURSE_PAGINATION_CONFIG);
  }

  async create(createDto: CreateCourseDto, additionalData?: DeepPartial<Course>): Promise<Course> {
    if (additionalData?.instructorId) {
      await this.subscriptionGuard.checkCourseCreation(additionalData.instructorId as string);
    }
    return super.create(createDto, additionalData);
  }

  async findById(id: string): Promise<Course> {
    return super.findByIdOrFail(id, { relations: ["instructor", "contents"] });
  }

  async findInstructorCourse(
    id: string,
    instructorId: string,
  ): Promise<Course> {
    const course = await this.findById(id);
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException("You do not own this course");
    }
    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    instructorId?: string,
  ): Promise<Course> {
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

  async getDashboardStats(instructorId: string) {
    const [totalCourses, videosResult, studentsResult] = await Promise.all([
      this.coursesRepository.count({
        where: { instructorId },
      }),
      this.coursesRepository.manager.createQueryBuilder()
        .select("COUNT(content.id)", "total")
        .from("course_content", "content")
        .innerJoin("course", "course", "content.courseId = course.id")
        .where("course.instructorId = :instructorId", { instructorId })
        .andWhere("content.contentType = :type", { type: ContentType.VIDEO })
        .getRawOne(),
      this.coursesRepository.manager.createQueryBuilder()
        .select("COUNT(DISTINCT enrollment.learnerId)", "total")
        .from("enrollment", "enrollment")
        .innerJoin("course", "course", "enrollment.courseId = course.id")
        .where("course.instructorId = :instructorId", { instructorId })
        .getRawOne()
    ]);

    return {
      totalCourses,
      totalVideos: parseInt(videosResult?.total || "0", 10),
      totalStudents: parseInt(studentsResult?.total || "0", 10),
    };
  }
}
