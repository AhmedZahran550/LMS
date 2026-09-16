import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Course } from "./entities/course.entity";
import { CourseContent } from "./entities/course-content.entity";
import { CoursePurchase } from "./entities/course-purchase.entity";
import { University } from "./entities/university.entity";
import { Category } from "./entities/category.entity";
import { StorageSubscription } from "./entities/storage-subscription.entity";
import { StorageAddon } from "./entities/storage-addon.entity";
import { StoragePlan } from "./entities/storage-plan.entity";
import { SystemConfig } from "./entities/system-config.entity";
import { DeviceToken } from "./entities/device-token.entity";
import { Log } from "./entities/log.entity";
import { Notification } from "./entities/notification.entity";
import { AppDataSource } from "./datasource";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([
      User,
      Course,
      CourseContent,
      CoursePurchase,
      University,
      Category,
      StorageSubscription,
      StorageAddon,
      StoragePlan,
      SystemConfig,
      DeviceToken,
      Log,
      Notification,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
