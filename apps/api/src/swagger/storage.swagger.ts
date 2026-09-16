import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import {
  CreateStoragePlanDto,
  UpdateStoragePlanDto,
  SubscribeStoragePlanDto,
} from "../modules/storage/dto/storage-plan.dto";

export const StorageSwagger = {
  getStorageUsage: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get instructor storage usage",
        description: "Returns effective quota (5 GB permanent base + active 3-month subscriptions + add-ons), used bytes, and active subscriptions. Instructor only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage usage and active subscriptions" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  getPlans: () =>
    applyDecorators(
      ApiOperation({
        summary: "List storage expansion plans",
        description: "Returns all active 3-month storage expansion tiers (e.g. 10 GB, 25 GB, 50 GB, 100 GB). Instructor only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "List of storage plans" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  subscribe: () =>
    applyDecorators(
      ApiOperation({
        summary: "Subscribe to storage expansion plan",
        description: "Initiates a 3-month storage plan expansion checkout session via Kashier. Instructor only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: SubscribeStoragePlanDto }),
      ApiResponse({ status: 201, description: "Storage subscription initiated with Kashier checkoutUrl" }),
      ApiResponse({ status: 400, description: "Bad request" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  createPlan: () =>
    applyDecorators(
      ApiOperation({
        summary: "Create storage plan (Admin)",
        description: "Creates a new 3-month storage expansion plan tier. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: CreateStoragePlanDto }),
      ApiResponse({ status: 201, description: "Storage plan created" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllPlans: () =>
    applyDecorators(
      ApiOperation({
        summary: "List all storage plans (Admin)",
        description: "Returns all storage expansion plans. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "List of all storage plans" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findOnePlan: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get storage plan by ID (Admin)",
        description: "Returns a single storage plan by UUID. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage plan found" }),
      ApiResponse({ status: 404, description: "Storage plan not found" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  updatePlan: () =>
    applyDecorators(
      ApiOperation({
        summary: "Update storage plan (Admin)",
        description: "Updates storage plan details. Admin only.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateStoragePlanDto }),
      ApiResponse({ status: 200, description: "Storage plan updated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  removePlan: () =>
    applyDecorators(
      ApiOperation({
        summary: "Delete storage plan (Admin)",
        description: "Soft deletes a storage expansion plan. Admin only.",
      }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage plan deleted" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),
};
