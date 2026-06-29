import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { CreateUserDto } from "../modules/users/dto/create-user.dto";
import { UpdateUserDto } from "../modules/users/dto/update-user.dto";
import { UpdateProfileDto } from "../modules/users/dto/update-profile.dto";
import { UpdatePreferencesDto } from "../modules/users/dto/update-preferences.dto";

export const UsersSwagger = {
  getProfile: () =>
    applyDecorators(
      ApiOperation({ summary: "Get current user profile", description: "Returns the authenticated user's profile." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "User profile retrieved" }),
      ApiResponse({ status: 401, description: "Unauthorized" }),
    ),

  updateProfile: () =>
    applyDecorators(
      ApiOperation({ summary: "Update profile", description: "Updates the authenticated user's first and last name." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateProfileDto }),
      ApiResponse({ status: 200, description: "Profile updated" }),
      ApiResponse({ status: 401, description: "Unauthorized" }),
    ),

  updatePreferences: () =>
    applyDecorators(
      ApiOperation({ summary: "Update preferences", description: "Updates the authenticated user's preferences (language, theme)." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdatePreferencesDto }),
      ApiResponse({ status: 200, description: "Preferences updated" }),
      ApiResponse({ status: 401, description: "Unauthorized" }),
    ),

  uploadAvatar: () =>
    applyDecorators(
      ApiOperation({ summary: "Upload avatar", description: "Uploads a profile avatar image." }),
      ApiBearerAuth(),
      ApiConsumes("multipart/form-data"),
      ApiBody({ description: "Avatar image file", schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } }),
      ApiResponse({ status: 201, description: "Avatar uploaded" }),
      ApiResponse({ status: 400, description: "File is required" }),
    ),

  createUser: () =>
    applyDecorators(
      ApiOperation({ summary: "Create user (Admin)", description: "Creates a new user. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ type: CreateUserDto }),
      ApiResponse({ status: 201, description: "User created" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllUsers: () =>
    applyDecorators(
      ApiOperation({ summary: "List all users (Admin)", description: "Returns paginated list of all users. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated users list" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findOneUser: () =>
    applyDecorators(
      ApiOperation({ summary: "Get user by ID (Admin)", description: "Returns a single user by ID. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "User found" }),
      ApiResponse({ status: 404, description: "User not found" }),
    ),

  updateUser: () =>
    applyDecorators(
      ApiOperation({ summary: "Update user (Admin)", description: "Updates a user's details. Admin only." }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateUserDto }),
      ApiResponse({ status: 200, description: "User updated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  removeUser: () =>
    applyDecorators(
      ApiOperation({ summary: "Deactivate user (Admin)", description: "Deactivates a user account. Admin only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "User deactivated" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findAllInstructors: () =>
    applyDecorators(
      ApiOperation({ summary: "List instructors (Learner)", description: "Returns paginated list of instructors. Learner only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Paginated instructors list" }),
      ApiResponse({ status: 403, description: "Forbidden" }),
    ),

  findOneInstructor: () =>
    applyDecorators(
      ApiOperation({ summary: "Get instructor by ID (Learner)", description: "Returns a single instructor's public profile. Learner only." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Instructor found" }),
      ApiResponse({ status: 404, description: "Instructor not found" }),
    ),
};
