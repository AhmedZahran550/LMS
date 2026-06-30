import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AssignCourseDto } from '../modules/instructor-students/dto/assign-course.dto';

export const CourseAssignmentsSwagger = {
  assign: () =>
    applyDecorators(
      ApiOperation({ summary: 'Assign student to courses (Instructor)', description: 'Assign a student to specific courses. Empty array removes all, omit to assign all.' }),
      ApiBearerAuth(),
      ApiBody({ type: AssignCourseDto }),
      ApiResponse({ status: 200, description: 'Courses assigned' }),
    ),

  getAssignments: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get student assignments (Instructor)', description: 'Returns course IDs the student is assigned to.' }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: 'Student course assignments' }),
    ),
};
