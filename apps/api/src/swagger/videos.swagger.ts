import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { CreateVideoDto } from "../modules/videos/dto/create-video.dto";
import { UpdateVideoDto } from "../modules/videos/dto/update-video.dto";
import { ReorderVideosDto } from "../modules/videos/dto/reorder-videos.dto";

export const VideosSwagger = {
  findAllContent: () =>
    applyDecorators(
      ApiOperation({ summary: "List course content (Instructor)", description: "Returns paginated list of course content items. Instructor only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated content list" }),
    ),

  uploadContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Upload content (Instructor)", description: "Uploads a new content item (video, PDF, etc.) to a course. Instructor only." }),
      ApiBearerAuth(),
      ApiConsumes("multipart/form-data"),
      ApiBody({ type: CreateVideoDto }),
      ApiResponse({ status: 201, description: "Content uploaded" }),
    ),

  reorderContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Reorder content (Instructor)", description: "Reorders content items within a course. Instructor only." }),
      ApiBearerAuth(),
      ApiBody({ type: ReorderVideosDto }),
      ApiResponse({ status: 200, description: "Content reordered" }),
    ),

  updateContent: () =>
    applyDecorators(
      ApiOperation({ summary: "Update content (Instructor)", description: "Updates a content item's metadata. Instructor only." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateVideoDto }),
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
