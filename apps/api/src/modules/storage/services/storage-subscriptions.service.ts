import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoragePlan } from '../../../db/entities/storage-plan.entity';
import { StorageSubscription } from '../../../db/entities/storage-subscription.entity';
import { User } from '../../../db/entities/user.entity';
import { KashierService } from '../../payments/kashier.service';
import {
  CreateStoragePlanDto,
  UpdateStoragePlanDto,
} from '../dto/storage-plan.dto';
import { StorageSubscriptionStatus } from '@lms/shared-types';

@Injectable()
export class StorageSubscriptionsService {
  private readonly logger = new Logger(StorageSubscriptionsService.name);

  constructor(
    @InjectRepository(StoragePlan)
    private readonly planRepository: Repository<StoragePlan>,
    @InjectRepository(StorageSubscription)
    private readonly subscriptionRepository: Repository<StorageSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kashierService: KashierService,
  ) {}

  async getActivePlans(): Promise<StoragePlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { gigabytes: 'ASC' },
    });
  }

  async getAllPlans(): Promise<StoragePlan[]> {
    return this.planRepository.find({
      order: { gigabytes: 'ASC' },
    });
  }

  async getPlanById(id: string): Promise<StoragePlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Storage plan not found');
    return plan;
  }

  async createPlan(dto: CreateStoragePlanDto): Promise<StoragePlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, dto: UpdateStoragePlanDto): Promise<StoragePlan> {
    const plan = await this.getPlanById(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async removePlan(id: string): Promise<void> {
    const plan = await this.getPlanById(id);
    await this.planRepository.softRemove(plan);
  }

  async initiateSubscription(instructorId: string, planId: string) {
    const plan = await this.getPlanById(planId);
    if (!plan.isActive) {
      throw new BadRequestException('Selected storage plan is not currently active');
    }

    const instructor = await this.userRepository.findOne({ where: { id: instructorId } });
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const orderId = `storage_${planId.replace(/-/g, '').substring(0, 8)}_${instructorId.replace(/-/g, '').substring(0, 8)}_${Date.now()}`;

    const now = new Date();
    const durationDays = plan.durationDays || 90;
    const endDate = new Date(now.getTime() + durationDays * 86400000);

    const subscription = this.subscriptionRepository.create({
      instructorId,
      storagePlanId: plan.id,
      status: StorageSubscriptionStatus.ACTIVE, // Will be activated via webhook or right here in test
      startDate: now,
      endDate,
      kashierOrderId: orderId,
    });

    await this.subscriptionRepository.save(subscription);

    const session = await this.kashierService.createPaymentSession({
      orderId,
      amount: Number(plan.price),
      currency: plan.currency || 'EGP',
      customerEmail: instructor.email,
      customerName: `${instructor.firstName} ${instructor.lastName}`.trim(),
      description: `Storage Plan Expansion: ${plan.name} (${plan.gigabytes} GB / 3 Months)`,
    });

    return {
      subscriptionId: subscription.id,
      orderId,
      checkoutUrl: session.checkoutUrl,
    };
  }

  async activateSubscription(orderId: string, paymentId?: string): Promise<StorageSubscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { kashierOrderId: orderId },
      relations: ['storagePlan'],
    });

    if (!subscription) {
      this.logger.warn(`Storage subscription not found for orderId: ${orderId}`);
      return null;
    }

    const now = new Date();
    const durationDays = subscription.storagePlan?.durationDays || 90;
    subscription.startDate = now;
    subscription.endDate = new Date(now.getTime() + durationDays * 86400000);
    subscription.status = StorageSubscriptionStatus.ACTIVE;
    if (paymentId) {
      subscription.kashierPaymentId = paymentId;
    }

    const saved = await this.subscriptionRepository.save(subscription);
    this.logger.log(`Activated storage subscription ${saved.id} for instructor ${saved.instructorId} until ${saved.endDate}`);
    return saved;
  }

  async getInstructorActiveSubscriptions(instructorId: string): Promise<StorageSubscription[]> {
    return this.subscriptionRepository.find({
      where: {
        instructorId,
        status: StorageSubscriptionStatus.ACTIVE,
      },
      relations: ['storagePlan'],
      order: { endDate: 'DESC' },
    });
  }
}
