import {
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionService } from './subscription.service';
import { CourseContent } from '../../../db/entities/course-content.entity';
import { InstructorStudent } from '../../../db/entities/instructor-student.entity';
import { StorageAddon } from '../../../db/entities/storage-addon.entity';
import {
  SubscriptionStatus,
  InstructorStudentStatus,
} from '@lms/shared-types';
import { ErrorCodes } from '../../../core/utils/error-codes';

@Injectable()
export class SubscriptionGuardService {
  private readonly logger = new Logger(SubscriptionGuardService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    @InjectRepository(InstructorStudent)
    private readonly instructorStudentRepository: Repository<InstructorStudent>,
    @InjectRepository(StorageAddon)
    private readonly storageAddonRepository: Repository<StorageAddon>,
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
    const baseStorage = BigInt(plan.baseStorageBytes || '0');
    const addonStorage = await this.getActiveAddonStorage(subscription.id);
    const effectiveStorage = baseStorage + addonStorage;

    if (effectiveStorage > 0) {
      const storageResult = await this.contentRepository
        .createQueryBuilder('content')
        .select('COALESCE(SUM(content.size), 0)', 'total')
        .innerJoin('course', 'c', 'content.courseId = c.id')
        .where('c.instructorId = :instructorId', { instructorId })
        .getRawOne();

      const currentStorage = BigInt(storageResult?.total || '0');
      if (currentStorage + BigInt(fileSize) > effectiveStorage) {
        throw new ForbiddenException({
          message: `You have reached the storage limit of ${this.formatBytes(Number(effectiveStorage))} on your ${plan.name} plan. Upgrade to upload more.`,
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

  private async getActiveAddonStorage(subscriptionId: string): Promise<bigint> {
    const addons = await this.storageAddonRepository.find({
      where: {
        instructorSubscriptionId: subscriptionId,
        isActive: true,
      },
    });

    const now = new Date();
    let total = BigInt(0);
    for (const addon of addons) {
      if (!addon.endDate || addon.endDate > now) {
        total += BigInt(addon.additionalBytes);
      }
    }
    return total;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
