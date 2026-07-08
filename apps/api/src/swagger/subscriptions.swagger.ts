import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCheckoutSessionDto } from "../modules/subscriptions/dto/create-checkout-session.dto";

export const SubscriptionsSwagger = {
  getAllSubscriptions: () =>
    applyDecorators(
      ApiOperation({ summary: "List all subscriptions (Admin)", description: "Returns all subscriptions. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Subscriptions list" }),
    ),

  getAllPlans: () =>
    applyDecorators(
      ApiOperation({ summary: "List subscription plans (Admin)", description: "Returns all active subscription plans. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Plans list" }),
    ),

  updateSubscriptionStatus: () =>
    applyDecorators(
      ApiOperation({ summary: "Update subscription status (Admin)", description: "Updates a subscription's status. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Subscription updated" }),
    ),

  getMySubscription: () =>
    applyDecorators(
      ApiOperation({ summary: "Get my subscription (Instructor)", description: "Returns the instructor's current subscription with usage." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Subscription usage" }),
    ),

  getPlans: () =>
    applyDecorators(
      ApiOperation({ summary: "List plans (Instructor)", description: "Returns all active subscription plans for the instructor." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Plans list" }),
    ),

  createCheckout: () =>
    applyDecorators(
      ApiOperation({ summary: "Create Stripe checkout (Instructor)", description: "Creates a Stripe checkout session for subscription payment." }),
      ApiBearerAuth(),
      ApiBody({ type: CreateCheckoutSessionDto }),
      ApiResponse({ status: 201, description: "Checkout URL returned" }),
    ),

  buyStorage: () =>
    applyDecorators(
      ApiOperation({ summary: "Buy storage add-on (Instructor)", description: "Creates a Stripe checkout session for a selected storage add-on plan." }),
      ApiBearerAuth(),
      ApiBody({ schema: { type: 'object', properties: { planId: { type: 'string', description: 'The ID of the storage plan' } } } }),
      ApiResponse({ status: 201, description: "Checkout URL returned" }),
    ),

  getStoragePlans: () =>
    applyDecorators(
      ApiOperation({ summary: "List storage plans (Instructor)", description: "Returns active storage plans available for purchase." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage plans list" }),
    ),

  getStorageAddons: () =>
    applyDecorators(
      ApiOperation({ summary: "Get storage add-ons (Instructor)", description: "Returns the instructor's active storage add-ons." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage add-ons list" }),
    ),

  adminGetStoragePlans: () =>
    applyDecorators(
      ApiOperation({ summary: "List storage plans (Admin)", description: "Returns all storage plans. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Storage plans list" }),
    ),

  adminCreateStoragePlan: () =>
    applyDecorators(
      ApiOperation({ summary: "Create storage plan (Admin)", description: "Creates a new storage plan. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ schema: { type: 'object', properties: { gigabytes: { type: 'number' }, pricePerGb: { type: 'number' } } } }),
      ApiResponse({ status: 201, description: "Storage plan created" }),
    ),

  adminUpdateStoragePlan: () =>
    applyDecorators(
      ApiOperation({ summary: "Update storage plan (Admin)", description: "Updates an existing storage plan. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ schema: { type: 'object', properties: { gigabytes: { type: 'number' }, pricePerGb: { type: 'number' }, isActive: { type: 'boolean' } } } }),
      ApiResponse({ status: 200, description: "Storage plan updated" }),
    ),

  createPortal: () =>
    applyDecorators(
      ApiOperation({ summary: "Create Stripe portal (Instructor)", description: "Creates a Stripe customer portal session for managing subscription." }),
      ApiBearerAuth(),
      ApiResponse({ status: 201, description: "Portal URL returned" }),
      ApiResponse({ status: 400, description: "No Stripe customer found" }),
    ),

  choosePlan: () =>
    applyDecorators(
      ApiOperation({ summary: "Choose subscription plan (Instructor)", description: "Selects a plan. Free plans are applied immediately; paid plans redirect to Stripe." }),
      ApiBearerAuth(),
      ApiBody({ type: CreateCheckoutSessionDto }),
      ApiResponse({ status: 201, description: "Plan chosen" }),
    ),

  refreshSubscription: () =>
    applyDecorators(
      ApiOperation({ summary: "Refresh subscription (Instructor)", description: "Refreshes the instructor's subscription usage data." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Refreshed subscription data" }),
    ),

  cancelSubscription: () =>
    applyDecorators(
      ApiOperation({ summary: "Cancel subscription (Instructor)", description: "Cancels the instructor's active subscription." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Subscription cancelled" }),
    ),

  handleWebhook: () =>
    applyDecorators(
      ApiOperation({ summary: "Stripe webhook", description: "Handles incoming Stripe webhook events (public endpoint)." }),
      ApiResponse({ status: 200, description: "Webhook received" }),
    ),
};
