import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCategoryDto } from "../modules/categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../modules/categories/dto/update-category.dto";

export const CategoriesSwagger = {
  findAllPublic: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get all active course categories",
        description: "Returns all active course categories with English/Arabic names and URL slugs.",
      }),
      ApiResponse({ status: 200, description: "List of active categories" }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({
        summary: "Create a new course category",
        description: "Creates a new category with Arabic translation and auto-slug. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: CreateCategoryDto }),
      ApiResponse({ status: 201, description: "Category created" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Paginated list of categories for admin",
        description: "Returns paginated list of all categories. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated categories list" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findOneAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get category by ID",
        description: "Returns category details. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Category found" }),
      ApiResponse({ status: 404, description: "Category not found" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  updateAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Update category",
        description: "Updates category name or status. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateCategoryDto }),
      ApiResponse({ status: 200, description: "Category updated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  removeAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: "Soft delete category",
        description: "Soft deletes a category. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Category deleted" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),
};
