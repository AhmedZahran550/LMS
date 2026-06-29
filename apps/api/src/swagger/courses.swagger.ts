import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCourseDto } from "../modules/courses/dto/create-course.dto";
import { UpdateCourseDto } from "../modules/courses/dto/update-course.dto";

export const CoursesSwagger = {
  createCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Create course (Instructor)", description: "Creates a new course. Instructor only." }),
      ApiBearerAuth(),
      ApiBody({ type: CreateCourseDto }),
      ApiResponse({ status: 201, description: "Course created" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllCourses: () =>
    applyDecorators(
      ApiOperation({ summary: "List instructor courses", description: "Returns paginated list of the instructor's courses." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated courses list" }),
    ),

  getDashboardStats: () =>
    applyDecorators(
      ApiOperation({ summary: "Get dashboard stats (Instructor)", description: "Returns dashboard statistics for the instructor." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Dashboard stats" }),
    ),

  findOneCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Get course by ID (Instructor)", description: "Returns a single course owned by the instructor." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course found" }),
      ApiResponse({ status: 404, description: "Course not found" }),
    ),

  updateCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Update course", description: "Updates a course's details." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateCourseDto }),
      ApiResponse({ status: 200, description: "Course updated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  removeCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Delete course", description: "Deletes a course." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course deleted" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllPublicCourses: () =>
    applyDecorators(
      ApiOperation({ summary: "List public courses (Learner)", description: "Returns paginated list of public courses. Learner only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated courses list" }),
    ),

  findOnePublicCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Get public course (Learner)", description: "Returns a single public course. Learner only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course found" }),
      ApiResponse({ status: 404, description: "Course not found" }),
    ),

  findAllAdminCourses: () =>
    applyDecorators(
      ApiOperation({ summary: "List all courses (Admin)", description: "Returns paginated list of all courses. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated courses list" }),
    ),

  findOneAdminCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Get course by ID (Admin)", description: "Returns a single course by ID. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course found" }),
    ),

  updateAdminCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Update course (Admin)", description: "Updates any course. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateCourseDto }),
      ApiResponse({ status: 200, description: "Course updated" }),
    ),

  removeAdminCourse: () =>
    applyDecorators(
      ApiOperation({ summary: "Delete course (Admin)", description: "Deletes any course. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course deleted" }),
    ),
};
