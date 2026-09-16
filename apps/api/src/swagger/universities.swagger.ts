import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CreateUniversityDto } from "../modules/universities/dto/create-university.dto";
import { UpdateUniversityDto } from "../modules/universities/dto/update-university.dto";

export const UniversitiesSwagger = {
  findAllPublic: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get all active universities with full academic hierarchy",
        description: "Returns all active universities with complete faculty, department, and year JSONB trees.",
      }),
      ApiResponse({ status: 200, description: "List of active universities" }),
    ),

  findOnePublic: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get single university details with faculties, departments, and years",
        description: "Returns details of a specific university by UUID.",
      }),
      ApiResponse({ status: 200, description: "University found" }),
      ApiResponse({ status: 404, description: "University not found" }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({
        summary: "Create new university with faculties hierarchy",
        description: "Creates a new university with faculties and departments. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: CreateUniversityDto }),
      ApiResponse({ status: 201, description: "University created" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Paginated list of universities for admin",
        description: "Returns paginated list of all universities with pagination parameters. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated universities list" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findOneAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get university by ID",
        description: "Returns single university for administration. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "University found" }),
      ApiResponse({ status: 404, description: "University not found" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  updateAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Update university or its faculties JSONB data",
        description: "Updates university name or its faculty tree. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateUniversityDto }),
      ApiResponse({ status: 200, description: "University updated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  removeAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Soft delete university",
        description: "Soft deletes a university by UUID. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "University deleted" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),
};
