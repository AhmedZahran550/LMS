import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { CreateCourseContentDto } from "../modules/course-content/dto/create-course-content.dto";
import { UpdateCourseContentDto } from "../modules/course-content/dto/update-course-content.dto";
import { ReorderCourseContentDto } from "../modules/course-content/dto/reorder-course-content.dto";

export const CourseContentSwagger = {
  findAllContent: () =>
    applyDecorators(
      ApiOperation({ summary: "List course content (Instructor)", description: "Returns paginated list of course content items. Instructor only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated content list" }),
    ),

  uploadContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Upload content (Instructor)", description: "Uploads a new content item (video, PDF, image, presentation) to a course. Instructor only." }),
      ApiBearerAuth(),
      ApiConsumes("multipart/form-data"),
      ApiBody({ type: CreateCourseContentDto }),
      ApiResponse({ status: 201, description: "Content uploaded" }),
    ),

  reorderContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Reorder content (Instructor)", description: "Reorders content items within a course. Instructor only." }),
      ApiBearerAuth(),
      ApiBody({ type: ReorderCourseContentDto }),
      ApiResponse({ status: 200, description: "Content reordered" }),
    ),

  updateContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Update content (Instructor)", description: "Updates a content item's metadata. Instructor only." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateCourseContentDto }),
      ApiResponse({ status: 200, description: "Content updated" }),
    ),

  removeContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Delete content (Instructor)", description: "Removes a content item from a course. Instructor only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Content deleted" }),
    ),

  findAllLearnerContent: () =>
    applyDecorators(
      ApiOperation({ summary: "List course content (Learner)", description: "Returns paginated list of course content for enrolled learners." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated content list" }),
    ),

  findOneLearnerContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Get content detail (Learner)", description: "Returns a single content item for an enrolled learner." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Content detail" }),
      ApiResponse({ status: 404, description: "Content not found" }),
    ),
};

export const VideosSwagger = CourseContentSwagger;
