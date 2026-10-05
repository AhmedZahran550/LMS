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
import { ContentType, PurchaseStatus } from "@lms/shared-types";

export const COURSE_PAGINATION_CONFIG: PaginateConfig<Course> = {
  sortableColumns: ["createdAt", "title", "price"],
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
    isActive: [FilterOperator.EQ],
    instructorId: [FilterOperator.EQ],
    categoryId: [FilterOperator.EQ],
  },
  relations: ["instructor", "category"],
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
  ) {
    super(coursesRepository, COURSE_PAGINATION_CONFIG);
  }

  async create(createDto: CreateCourseDto, additionalData?: DeepPartial<Course>): Promise<Course> {
    return super.create(createDto, additionalData);
  }

  async findById(id: string): Promise<Course> {
    return super.findByIdOrFail(id, { relations: ["instructor", "contents", "category"] });
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
    const [totalCourses, contentResult, studentsResult] = await Promise.all([
      this.coursesRepository.count({
        where: { instructorId },
      }),
      this.coursesRepository.manager.createQueryBuilder()
        .select("COUNT(content.id)", "total")
        .from("course_content", "content")
        .innerJoin("course", "course", "content.courseId = course.id")
        .where("course.instructorId = :instructorId", { instructorId })
        .getRawOne(),
      this.coursesRepository.manager.createQueryBuilder()
        .select("COUNT(DISTINCT purchase.studentId)", "total")
        .from("course_purchases", "purchase")
        .innerJoin("course", "course", "purchase.courseId = course.id")
        .where("course.instructorId = :instructorId", { instructorId })
        .andWhere("purchase.status = :status", { status: PurchaseStatus.COMPLETED })
        .getRawOne(),
    ]);

    const totalContentCount = parseInt(contentResult?.total || "0", 10);

    return {
      totalCourses,
      totalContent: totalContentCount,
      totalVideos: totalContentCount,
      totalStudents: parseInt(studentsResult?.total || "0", 10),
    };
  }
}
