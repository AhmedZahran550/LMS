import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { TestPushNotificationDto } from "../modules/push-notifications/dto/test-push-notification.dto";

export const PushNotificationsSwagger = {
  testPushNotification: () =>
    applyDecorators(
      ApiOperation({
        summary: "Test Push Notification",
        description: "Sends a test push notification to a specific user using Firebase Cloud Messaging without creating a database-backed in-app notification.",
      }),
      ApiBearerAuth(),
      ApiBody({ type: TestPushNotificationDto }),
      ApiResponse({ status: 200, description: "Push notification successfully queued for sending." }),
      ApiResponse({ status: 400, description: "Bad Request - Invalid payload." }),
      ApiResponse({ status: 401, description: "Unauthorized." }),
      ApiResponse({ status: 403, description: "Forbidden - Requires admin privileges." }),
    ),
};
