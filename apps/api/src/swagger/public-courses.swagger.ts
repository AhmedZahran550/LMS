import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

export const PublicCoursesSwagger = {
  findAllCourses: () =>
    applyDecorators(
      ApiOperation({
        summary: "Browse and search public courses",
        description: "Returns paginated list of active courses with category, instructor, and metadata. No authentication required.",
      }),
      ApiResponse({ status: 200, description: "Paginated public course list" }),
    ),

  findCourseById: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get public course details with preview lessons",
        description: "Returns course details, instructor profile, total lesson count, and preview-only lessons. Private lessons remain hidden.",
      }),
      ApiResponse({ status: 200, description: "Course details with preview content" }),
      ApiResponse({ status: 404, description: "Course not found" }),
    ),

  findAllInstructors: () =>
    applyDecorators(
      ApiOperation({
        summary: "Search public instructors",
        description: "Returns paginated list of instructors, filterable by university or searchable by name. No authentication required.",
      }),
      ApiResponse({ status: 200, description: "Paginated instructors list" }),
    ),

  findInstructorById: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get instructor public profile and courses",
        description: "Returns instructor public profile along with all active courses authored by them. No authentication required.",
      }),
      ApiResponse({ status: 200, description: "Instructor profile and course list" }),
      ApiResponse({ status: 404, description: "Instructor not found" }),
    ),
};
