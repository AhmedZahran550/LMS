import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Paginate, PaginateQuery } from "nestjs-paginate";
import { CoursesService } from "../courses.service";
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/auth/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";
import {
  UserRole,
  PaginatedResponse,
  CourseVisibility,
} from "@lms/shared-types";
import { CoursesSwagger } from "../../../swagger/courses.swagger";

@ApiTags("Learner Courses")
@Controller("learner/courses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @CoursesSwagger.findAllPublicCourses()
  async findAll(@Paginate() query: PaginateQuery) {
    return this.coursesService.findAll({
      ...query,
      where: { visibility: CourseVisibility.PUBLIC },
    });
  }

  @Get(":id")
  @CoursesSwagger.findOnePublicCourse()
  async findOne(@Param("id") id: string) {
    const course: any = await this.coursesService.findById(id);
    course.videos = [];
    if (course.instructor) {
      const { password, hashedRefreshToken, ...safeUser } = course.instructor;
      course.instructor = safeUser as any;
    }
    return course;
  }
}
