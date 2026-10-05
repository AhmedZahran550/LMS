import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InitUploadSessionDto } from '../modules/upload/dto/init-upload-session.dto';
import { UploadSessionResponseDto, UploadStatusResponseDto } from '../modules/upload/dto/upload-session-response.dto';
import { CompleteCourseContentUploadDto } from '../modules/course-content/dto/complete-course-content-upload.dto';

export const UploadSwagger = {
  initSession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Initialize direct upload session (Instructor)',
        description:
          'Validates instructor quota, reserves storage, and returns short-lived signed direct-upload credentials for the active cloud provider (Cloudinary). The client then transmits the file straight to the provider, bypassing API RAM and bandwidth entirely.',
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'courseId', description: 'Course UUID' }),
      ApiBody({ type: InitUploadSessionDto }),
      ApiResponse({
        status: 201,
        description: 'Upload session initialized with credentials',
        type: UploadSessionResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid input parameters or unsupported MIME type',
      }),
      ApiResponse({
        status: 403,
        description: 'Forbidden or course not owned by instructor',
      }),
      ApiResponse({
        status: 413,
        description: 'Storage quota exceeded (5 GB permanent base + active add-ons)',
      }),
    ),

  getStatus: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get upload session status and resume offset',
        description:
          'Returns current bytes uploaded and nextByteOffset. Allows Web and Mobile clients to resume interrupted uploads seamlessly.',
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'sessionId', description: 'Upload session UUID' }),
      ApiResponse({
        status: 200,
        description: 'Current upload offset and progress status',
        type: UploadStatusResponseDto,
      }),
      ApiResponse({ status: 404, description: 'Upload session not found' }),
    ),

  completeUpload: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Complete direct upload & commit course content (Instructor)',
        description:
          'Validates completed upload, finalizes asset in storage, creates CourseContent database record, commits quota, and triggers notifications to enrolled students.',
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'courseId', description: 'Course UUID' }),
      ApiBody({ type: CompleteCourseContentUploadDto }),
      ApiResponse({
        status: 201,
        description: 'CourseContent created and ready for viewing',
      }),
      ApiResponse({
        status: 400,
        description: 'Session is not complete, signature mismatch, or invalid asset',
      }),
      ApiResponse({ status: 404, description: 'Course or upload session not found' }),
    ),

  abortSession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Abort upload session (Instructor)',
        description:
          'Cancels an in-progress direct upload, removes any orphaned cloud asset, and releases reserved storage quota.',
      }),
      ApiBearerAuth(),
      ApiParam({ name: 'sessionId', description: 'Upload session UUID' }),
      ApiResponse({
        status: 200,
        description: 'Session successfully aborted and quota released',
      }),
      ApiResponse({ status: 404, description: 'Upload session not found' }),
    ),
};
