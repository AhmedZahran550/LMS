import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { RespondEnrollmentDto } from "../modules/enrollments/dto/respond-enrollment.dto";
import { InviteLearnerDto } from "../modules/enrollments/dto/invite-learner.dto";

export const EnrollmentsSwagger = {
  requestEnrollment: () =>
    applyDecorators(
      ApiOperation({ summary: "Request enrollment (Learner)", description: "Requests enrollment in a course as a learner." }),
      ApiBearerAuth(),
      ApiResponse({ status: 201, description: "Enrollment requested" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  getMyCourses: () =>
    applyDecorators(
      ApiOperation({ summary: "Get my courses (Learner)", description: "Returns the learner's enrolled courses." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Enrolled courses list" }),
    ),

  getMyCourseDetail: () =>
    applyDecorators(
      ApiOperation({ summary: "Get course detail (Learner)", description: "Returns enrolled course with contents." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course detail with contents" }),
      ApiResponse({ status: 403, description: "Not enrolled" }),
    ),

  findAllEnrollments: () =>
    applyDecorators(
      ApiOperation({ summary: "List all enrollments (Admin)", description: "Returns paginated list of all enrollments. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated enrollments list" }),
    ),

  updateEnrollment: () =>
    applyDecorators(
      ApiOperation({ summary: "Update enrollment (Admin)", description: "Updates enrollment status. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ type: RespondEnrollmentDto }),
      ApiResponse({ status: 200, description: "Enrollment updated" }),
    ),

  getCourseEnrollments: () =>
    applyDecorators(
      ApiOperation({ summary: "Get course enrollments (Instructor)", description: "Returns enrollments for an instructor's course." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Course enrollments list" }),
    ),

  respondToEnrollment: () =>
    applyDecorators(
      ApiOperation({ summary: "Respond to enrollment (Instructor)", description: "Approves or rejects an enrollment request." }),
      ApiBearerAuth(),
      ApiBody({ type: RespondEnrollmentDto }),
      ApiResponse({ status: 200, description: "Enrollment responded" }),
    ),

  inviteLearner: () =>
    applyDecorators(
      ApiOperation({ summary: "Invite learner (Instructor)", description: "Invites a learner to enroll in a course." }),
      ApiBearerAuth(),
      ApiBody({ type: InviteLearnerDto }),
      ApiResponse({ status: 201, description: "Learner invited" }),
    ),

  removeEnrollment: () =>
    applyDecorators(
      ApiOperation({ summary: "Remove learner (Instructor)", description: "Removes a learner from a course." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Learner removed" }),
    ),
};
