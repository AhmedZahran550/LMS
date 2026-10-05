import {
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../db/entities/user.entity';
import { CourseContent } from '../../../db/entities/course-content.entity';
import { StorageSubscription } from '../../../db/entities/storage-subscription.entity';
import { StorageAddon } from '../../../db/entities/storage-addon.entity';
import { StorageSubscriptionStatus, UserRole } from '@lms/shared-types';

@Injectable()
export class StorageQuotaGuardService {
  private readonly logger = new Logger(StorageQuotaGuardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    @InjectRepository(StorageSubscription)
    private readonly subscriptionRepository: Repository<StorageSubscription>,
    @InjectRepository(StorageAddon)
    private readonly addonRepository: Repository<StorageAddon>,
  ) {}

  async checkUploadAllowed(
    instructorId: string,
    fileSize: number,
    userRole?: string,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;

    const user = await this.userRepository.findOne({ where: { id: instructorId } });
    if (!user) {
      throw new NotFoundException('Instructor not found');
    }

    const { effectiveStorageBytes, totalStorageBytes } = await this.getStorageUsage(
      instructorId,
    );

    const newTotal = totalStorageBytes + BigInt(fileSize);
    if (newTotal > effectiveStorageBytes) {
      throw new ForbiddenException({
        message: `Storage limit exceeded. Available: ${this.formatBytes(
          Number(effectiveStorageBytes),
        )}, attempted: ${this.formatBytes(Number(newTotal))}. Please purchase an expansion plan to upload more content.`,
        errorCode: 'STORAGE_LIMIT_EXCEEDED',
      });
    }
  }

  async getStorageUsage(instructorId: string) {
    const user = await this.userRepository.findOne({ where: { id: instructorId } });
    const baseStorageBytes = BigInt(user?.storageQuotaBytes || '5368709120'); // Default 5GB

    const now = new Date();

    // 1. Calculate active 3-month storage subscriptions
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: {
        instructorId,
        status: StorageSubscriptionStatus.ACTIVE,
      },
      relations: ['storagePlan'],
    });

    let activeSubscriptionBytes = BigInt(0);
    for (const sub of activeSubscriptions) {
      if (!sub.endDate || sub.endDate > now) {
        const gigabytes = sub.storagePlan?.gigabytes || 0;
        activeSubscriptionBytes += BigInt(gigabytes) * BigInt(1024 * 1024 * 1024);
      }
    }

    // 2. Calculate active 3-month storage add-ons
    const activeAddons = await this.addonRepository.find({
      where: {
        instructorId,
        isActive: true,
      },
    });

    let addonStorageBytes = BigInt(0);
    for (const addon of activeAddons) {
      if (!addon.endDate || addon.endDate > now) {
        addonStorageBytes += BigInt(addon.additionalBytes || '0');
      }
    }

    const effectiveStorageBytes =
      baseStorageBytes + activeSubscriptionBytes + addonStorageBytes;

    // 3. Calculate used storage
    const storageResult = await this.contentRepository
      .createQueryBuilder('content')
      .select('COALESCE(SUM(content.size), 0)', 'total')
      .innerJoin('course', 'c', 'content.courseId = c.id')
      .where('c.instructorId = :instructorId', { instructorId })
      .getRawOne();

    const totalStorageBytes = BigInt(storageResult?.total || '0');

    return {
      totalStorageBytes,
      baseStorageBytes,
      activeSubscriptionBytes,
      addonStorageBytes,
      effectiveStorageBytes,
      percentageUsed:
        effectiveStorageBytes > 0
          ? Number((totalStorageBytes * BigInt(100)) / effectiveStorageBytes)
          : 0,
    };
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
