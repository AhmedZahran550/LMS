import {
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionService } from './subscription.service';
import { Course } from '../../../db/entities/course.entity';
import { CourseContent } from '../../../db/entities/course-content.entity';
import { Enrollment } from '../../../db/entities/enrollment.entity';
import { InstructorStudent } from '../../../db/entities/instructor-student.entity';
import {
  SubscriptionStatus,
  EnrollmentStatus,
  InstructorStudentStatus,
} from '@lms/shared-types';
import { ErrorCodes } from '../../../core/utils/error-codes';

@Injectable()
export class SubscriptionGuardService {
  private readonly logger = new Logger(SubscriptionGuardService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(InstructorStudent)
    private readonly instructorStudentRepository: Repository<InstructorStudent>,
  ) {}

  private async getSubscriptionOrThrow(instructorId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(
      instructorId,
    );
    if (!subscription) {
      throw new NotFoundException({
        message:
          'No subscription found. Please choose a plan before creating courses.',
        code: ErrorCodes.SUBSCRIPTION_NOT_FOUND,
      });
    }
    return subscription;
  }

  async checkCourseCreation(instructorId: string): Promise<void> {
    const subscription = await this.getSubscriptionOrThrow(instructorId);

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new ForbiddenException({
        message: 'Your subscription has expired. Please renew to create courses.',
        code: ErrorCodes.SUBSCRIPTION_EXPIRED,
      });
    }

    if (
      subscription.status === SubscriptionStatus.CANCELLED &&
      (!subscription.endDate || new Date() > subscription.endDate)
    ) {
      throw new ForbiddenException({
        message: 'Your subscription is inactive. Please renew to create courses.',
        code: ErrorCodes.SUBSCRIPTION_INACTIVE,
      });
    }

    const plan = subscription.plan;
    if (plan.maxCourses > 0) {
      const courseCount = await this.courseRepository.count({
        where: { instructorId },
      });
      if (courseCount >= plan.maxCourses) {
        throw new ForbiddenException({
          message: `You have reached the maximum of ${plan.maxCourses} courses on your ${plan.name} plan. Upgrade to create more.`,
          code: ErrorCodes.COURSE_LIMIT_REACHED,
        });
      }
    }
  }

  async checkContentUpload(
    instructorId: string,
    fileSize: number,
  ): Promise<void> {
    const subscription = await this.getSubscriptionOrThrow(instructorId);

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new ForbiddenException({
        message: 'Your subscription has expired. Please renew to upload content.',
        code: ErrorCodes.SUBSCRIPTION_EXPIRED,
      });
    }

    if (
      subscription.status === SubscriptionStatus.CANCELLED &&
      (!subscription.endDate || new Date() > subscription.endDate)
    ) {
      throw new ForbiddenException({
        message: 'Your subscription is inactive. Please renew to upload content.',
        code: ErrorCodes.SUBSCRIPTION_INACTIVE,
      });
    }

    const plan = subscription.plan;
    if (plan.maxStorageBytes > 0) {
      const storageResult = await this.contentRepository
        .createQueryBuilder('content')
        .select('COALESCE(SUM(content.size), 0)', 'total')
        .innerJoin('course', 'c', 'content.courseId = c.id')
        .where('c.instructorId = :instructorId', { instructorId })
        .getRawOne();

      const currentStorage = parseInt(storageResult?.total || '0', 10);
      if (currentStorage + fileSize > plan.maxStorageBytes) {
        throw new ForbiddenException({
          message: `You have reached the storage limit of ${this.formatBytes(plan.maxStorageBytes)} on your ${plan.name} plan. Upgrade to upload more.`,
          code: ErrorCodes.STORAGE_LIMIT_REACHED,
        });
      }
    }
  }

  async checkStudentAcceptance(instructorId: string, _courseId?: string): Promise<void> {
    const subscription = await this.getSubscriptionOrThrow(instructorId);

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new ForbiddenException({
        message: 'Your subscription has expired. Please renew to accept students.',
        code: ErrorCodes.SUBSCRIPTION_EXPIRED,
      });
    }

    if (
      subscription.status === SubscriptionStatus.CANCELLED &&
      (!subscription.endDate || new Date() > subscription.endDate)
    ) {
      throw new ForbiddenException({
        message: 'Your subscription is inactive. Please renew to accept students.',
        code: ErrorCodes.SUBSCRIPTION_INACTIVE,
      });
    }

    const plan = subscription.plan;
    if (plan.maxTotalStudents > 0) {
      const studentCount = await this.instructorStudentRepository.count({
        where: { instructorId, status: InstructorStudentStatus.ACTIVE },
      });

      if (studentCount >= plan.maxTotalStudents) {
        throw new ForbiddenException({
          message: `You have reached the maximum of ${plan.maxTotalStudents} students on your ${plan.name} plan. Upgrade to accept more.`,
          code: ErrorCodes.STUDENT_LIMIT_REACHED,
        });
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
