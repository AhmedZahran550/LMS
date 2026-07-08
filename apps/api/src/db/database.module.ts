import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../db/entities/user.entity";
import { Course } from "../db/entities/course.entity";
import { Enrollment } from "../db/entities/enrollment.entity";
import { Log } from "../db/entities/log.entity";
import { Notification } from "../db/entities/notification.entity";
import { CourseContent } from "./entities/course-content.entity";
import { SubscriptionPlan } from "./entities/subscription-plan.entity";
import { InstructorSubscription } from "./entities/instructor-subscription.entity";
import { Payment } from "./entities/payment.entity";
import { InstructorStudent } from "./entities/instructor-student.entity";
import { CourseAssignment } from "./entities/course-assignment.entity";
import { StorageAddon } from "./entities/storage-addon.entity";
import { StoragePlan } from "./entities/storage-plan.entity";
import { SystemConfig } from "./entities/system-config.entity";
import { DeviceToken } from "./entities/device-token.entity";
import { AppDataSource } from "./datasource";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([
      User,
      Course,
      Enrollment,
      Log,
      Notification,
      CourseContent,
      SubscriptionPlan,
      InstructorSubscription,
      Payment,
      InstructorStudent,
      CourseAssignment,
      StorageAddon,
      StoragePlan,
      SystemConfig,
      DeviceToken,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
