import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InviteStudentDto } from '../modules/instructor-students/dto/invite-student.dto';
import { RespondRequestDto } from '../modules/instructor-students/dto/respond-request.dto';

export const InstructorStudentsSwagger = {
  invite: () =>
    applyDecorators(
      ApiOperation({ summary: 'Invite student by email (Instructor)', description: 'Sends an invitation email to a student email address.' }),
      ApiBearerAuth(),
      ApiBody({ type: InviteStudentDto }),
      ApiResponse({ status: 201, description: 'Invitation sent' }),
      ApiResponse({ status: 403, description: 'Student limit reached or rate limited' }),
      ApiResponse({ status: 409, description: 'Already linked' }),
    ),

  listStudents: () =>
    applyDecorators(
      ApiOperation({ summary: 'List students (Instructor)', description: 'Returns paginated list of students linked to the instructor.' }),
      ApiBearerAuth(),
      ApiQuery({ name: 'status', required: false, enum: ['invited', 'requested', 'active', 'removed'] }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiResponse({ status: 200, description: 'Paginated student list' }),
    ),

  listRequests: () =>
    applyDecorators(
      ApiOperation({ summary: 'List join requests (Instructor)', description: 'Returns pending student join requests.' }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: 'Join requests list' }),
    ),

  respondToRequest: () =>
    applyDecorators(
      ApiOperation({ summary: 'Respond to join request (Instructor)', description: 'Approve or decline a student join request.' }),
      ApiBearerAuth(),
      ApiBody({ type: RespondRequestDto }),
      ApiResponse({ status: 200, description: 'Request responded' }),
      ApiResponse({ status: 403, description: 'Student limit reached' }),
    ),

  removeStudent: () =>
    applyDecorators(
      ApiOperation({ summary: 'Remove student (Instructor)', description: 'Removes a student from the instructor\'s student list.' }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: 'Student removed' }),
    ),

  searchInstructors: () =>
    applyDecorators(
      ApiOperation({ summary: 'Search instructors (Learner)', description: 'Search for instructors by name.' }),
      ApiBearerAuth(),
      ApiQuery({ name: 'q', required: true, type: String }),
      ApiResponse({ status: 200, description: 'Instructor search results' }),
    ),

  requestToJoin: () =>
    applyDecorators(
      ApiOperation({ summary: 'Request to join instructor (Learner)', description: 'Send a join request to an instructor.' }),
      ApiBearerAuth(),
      ApiResponse({ status: 201, description: 'Join request sent' }),
      ApiResponse({ status: 409, description: 'Already linked or pending' }),
    ),

  acceptInvitation: () =>
    applyDecorators(
      ApiOperation({ summary: 'Accept invitation (Learner)', description: 'Accept an instructor invitation via token.' }),
      ApiQuery({ name: 'token', required: true, type: String }),
      ApiResponse({ status: 200, description: 'Invitation accepted' }),
      ApiResponse({ status: 410, description: 'Invitation expired' }),
      ApiResponse({ status: 400, description: 'Invalid token' }),
    ),

  myInstructors: () =>
    applyDecorators(
      ApiOperation({ summary: 'My instructors (Learner)', description: 'Returns instructors the student is linked to.' }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: 'Instructors list' }),
    ),
};
