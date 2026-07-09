import { Module } from "@nestjs/common";
import { PushNotificationService } from "./push-notifications.service";
import { AdminPushNotificationsController } from "./controllers/admin-push-notifications.controller";

@Module({
  controllers: [AdminPushNotificationsController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationsModule {}
