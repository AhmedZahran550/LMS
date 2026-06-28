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
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
