import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

export const CoursePurchasesSwagger = {
  purchaseCourse: () =>
    applyDecorators(
      ApiOperation({
        summary: "Purchase or enroll in course",
        description: "Initiates a Kashier payment session for paid courses, or enrolls the student immediately if the course is free (0 EGP). Learner only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 201, description: "Purchase initiated (returns checkoutUrl for paid or completed status for free)" }),
      ApiResponse({ status: 400, description: "Bad request" }),
      ApiResponse({ status: 409, description: "Already enrolled in course" }),
    ),

  getMyCourses: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get student purchased courses",
        description: "Returns paginated list of all courses purchased and enrolled by the logged-in student. Learner only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated list of purchased courses" }),
      ApiResponse({ status: 401, description: "Unauthorized" }),
    ),

  getMyCourseById: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get purchased course details with full content",
        description: "Returns the complete course details and all unlocked content items (both preview and private) for a purchased course. Learner only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Full course with unlocked lessons" }),
      ApiResponse({ status: 403, description: "Course not purchased by this student" }),
      ApiResponse({ status: 404, description: "Course not found" }),
    ),

  getCourseSales: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get course sales list (Instructor)",
        description: "Returns detailed list of all students who purchased this course, including price paid, platform commission deducted, and net instructor revenue. Instructor only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course sales breakdown" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
      ApiResponse({ status: 404, description: "Course not found" }),
    ),

  getRevenue: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get instructor revenue summary",
        description: "Returns total sales count, gross revenue, platform commissions deducted, and net earnings across all instructor courses. Instructor only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Aggregated revenue summary" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),
};
