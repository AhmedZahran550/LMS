import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InstructorStudent } from '../../db/entities/instructor-student.entity';
import { CourseAssignment } from '../../db/entities/course-assignment.entity';
import { User } from '../../db/entities/user.entity';
import { InstructorStudentsService } from './services/instructor-students.service';
import { InstructorStudentsController } from './controllers/instructor-students.controller';
import { StudentInstructorsController } from './controllers/learner-instructors.controller';
import { LearnerInvitationsController } from './controllers/learner-invitations.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructorStudent, CourseAssignment, User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    UsersModule,
    CoursesModule,
    SubscriptionsModule,
    MailModule,
  ],
  controllers: [
    InstructorStudentsController,
    StudentInstructorsController,
    LearnerInvitationsController,
  ],
  providers: [InstructorStudentsService],
  exports: [InstructorStudentsService],
})
export class InstructorStudentsModule {}
