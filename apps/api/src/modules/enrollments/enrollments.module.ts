import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { AdminEnrollmentsController } from './controllers/admin-enrollments.controller';
import { InstructorEnrollmentsController } from './controllers/instructor-enrollments.controller';
import { LearnerEnrollmentsController } from './controllers/learner-enrollments.controller';
import { Enrollment } from './entities/enrollment.entity';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { ContentModule } from '../videos/videos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    CoursesModule,
    UsersModule,
    ContentModule,
  ],
  controllers: [
    AdminEnrollmentsController,
    InstructorEnrollmentsController,
    LearnerEnrollmentsController,
  ],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
