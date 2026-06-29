import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

export const NotificationsSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: "List notifications", description: "Returns all notifications for the authenticated user." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Notifications list" }),
    ),

  markAsRead: () =>
    applyDecorators(
      ApiOperation({ summary: "Mark notification as read", description: "Marks a single notification as read." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Notification marked as read" }),
      ApiResponse({ status: 404, description: "Notification not found" }),
    ),

  markAllAsRead: () =>
    applyDecorators(
      ApiOperation({ summary: "Mark all notifications as read", description: "Marks all unread notifications as read." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "All notifications marked as read" }),
    ),
};
