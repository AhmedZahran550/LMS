import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../db/entities/user.entity";
import { Course } from "../db/entities/course.entity";
import { Enrollment } from "../db/entities/enrollment.entity";
import { Log } from "../db/entities/log.entity";
import { Notification } from "../db/entities/notification.entity";
import { CourseContent } from "./entities/course-content.entity";
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
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
