import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import stripeConfig from '../../../config/stripe.config';
import { SubscriptionPlan } from '../../../db/entities/subscription-plan.entity';
import { InstructorSubscription } from '../../../db/entities/instructor-subscription.entity';
import { Payment } from '../../../db/entities/payment.entity';
import { User } from '../../../db/entities/user.entity';
import { Course } from '../../../db/entities/course.entity';
import { CourseContent } from '../../../db/entities/course-content.entity';
import { Enrollment } from '../../../db/entities/enrollment.entity';
import {
  SubscriptionPlanType,
  SubscriptionStatus,
  PaymentStatus,
  EnrollmentStatus,
} from '@lms/shared-types';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(InstructorSubscription)
    private readonly subscriptionRepository: Repository<InstructorSubscription>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @Inject(stripeConfig.KEY)
    private readonly stripeConf: ConfigType<typeof stripeConfig>,
  ) {}

  async getFreePlan(): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({
      where: { name: SubscriptionPlanType.FREE, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Free plan not found');
    }
    return plan;
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async getPlanByType(type: SubscriptionPlanType): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({
      where: { name: type, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException(`Plan "${type}" not found`);
    }
    return plan;
  }

  async getAllActivePlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async getOrCreateFreeSubscription(
    instructorId: string,
  ): Promise<InstructorSubscription> {
    const existing = await this.subscriptionRepository.findOne({
      where: { instructorId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    if (existing) {
      await this.checkAndUpdateExpiry(existing);
      return existing;
    }

    const freePlan = await this.getFreePlan();
    const now = new Date();
    const trialEnd = new Date(now.getTime() + freePlan.trialDays * 86400000);

    const subscription = this.subscriptionRepository.create({
      instructorId,
      planId: freePlan.id,
      status: SubscriptionStatus.TRIALING,
      startDate: now,
      trialEndDate: trialEnd,
      endDate: trialEnd,
      autoRenew: false,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    saved.plan = freePlan;
    return saved;
  }

  async getActiveSubscription(
    instructorId: string,
  ): Promise<InstructorSubscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { instructorId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    if (!subscription) return null;

    await this.checkAndUpdateExpiry(subscription);
    return subscription;
  }

  async getSubscriptionById(id: string): Promise<InstructorSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['plan'],
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  private async checkAndUpdateExpiry(
    subscription: InstructorSubscription,
  ): Promise<void> {
    if (
      subscription.status === SubscriptionStatus.TRIALING &&
      subscription.trialEndDate &&
      new Date() > subscription.trialEndDate
    ) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription.endDate = new Date();
      await this.subscriptionRepository.save(subscription);
    }

    if (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.endDate &&
      new Date() > subscription.endDate
    ) {
      if (subscription.autoRenew) {
        // Stripe will handle renewal via webhook
        return;
      }
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async getUsage(instructorId: string) {
    const subscription = await this.getActiveSubscription(instructorId);
    if (!subscription) {
      const freePlan = await this.getFreePlan();
      return {
        plan: freePlan,
        subscription: null,
        coursesCount: 0,
        totalStudents: 0,
        totalStorageBytes: 0,
      };
    }

    const [coursesCount, studentsResult, storageResult] = await Promise.all([
      this.courseRepository.count({ where: { instructorId } }),
      this.enrollmentRepository
        .createQueryBuilder('e')
        .select('COUNT(DISTINCT e.learnerId)', 'total')
        .innerJoin('course', 'c', 'e.courseId = c.id')
        .where('c.instructorId = :instructorId', { instructorId })
        .andWhere('e.status = :status', {
          status: EnrollmentStatus.APPROVED,
        })
        .getRawOne(),
      this.contentRepository
        .createQueryBuilder('content')
        .select('COALESCE(SUM(content.size), 0)', 'total')
        .innerJoin('course', 'c', 'content.courseId = c.id')
        .where('c.instructorId = :instructorId', { instructorId })
        .getRawOne(),
    ]);

    return {
      plan: subscription.plan,
      subscription,
      coursesCount,
      totalStudents: parseInt(studentsResult?.total || '0', 10),
      totalStorageBytes: parseInt(storageResult?.total || '0', 10),
    };
  }

  async upgradeSubscription(
    instructorId: string,
    planId: string,
    stripeSubscriptionId: string,
  ): Promise<InstructorSubscription> {
    const plan = await this.getPlanById(planId);
    const now = new Date();

    const current = await this.subscriptionRepository.findOne({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });

    if (current) {
      current.status = SubscriptionStatus.CANCELLED;
      await this.subscriptionRepository.save(current);
    }

    const endDate = new Date(now.getTime() + 30 * 86400000);

    const subscription = this.subscriptionRepository.create({
      instructorId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripeSubscriptionId,
      autoRenew: true,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    saved.plan = plan;
    return saved;
  }

  async cancelSubscription(instructorId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    subscription.autoRenew = false;

    if (subscription.status === SubscriptionStatus.TRIALING) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.endDate = new Date();
    }

    await this.subscriptionRepository.save(subscription);
  }

  async expireSubscription(instructorId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.EXPIRED;
    subscription.endDate = new Date();
    await this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(
    instructorId: string,
    stripeSubscriptionId: string,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { instructorId, stripeSubscriptionId },
    });

    if (!subscription) return;

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 86400000);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.endDate = endDate;
    await this.subscriptionRepository.save(subscription);
  }

  async setStripeCustomerId(
    instructorId: string,
    customerId: string,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });

    if (subscription) {
      subscription.stripeCustomerId = customerId;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async getStripePriceId(planType: SubscriptionPlanType): Promise<string> {
    if (planType === SubscriptionPlanType.PRO) {
      return this.stripeConf.pricePro;
    }
    if (planType === SubscriptionPlanType.PLUS) {
      return this.stripeConf.pricePlus;
    }
    throw new BadRequestException('No Stripe price for Free plan');
  }

  async recordPayment(
    instructorSubscriptionId: string,
    amount: number,
    currency: string,
    stripePaymentIntentId: string,
    stripeInvoiceId?: string,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      instructorSubscriptionId,
      amount,
      currency,
      status: PaymentStatus.SUCCEEDED,
      stripePaymentIntentId,
      stripeInvoiceId,
    });
    return this.paymentRepository.save(payment);
  }

  async getSubscriptionByStripeId(
    stripeSubscriptionId: string,
  ): Promise<InstructorSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
      relations: ['plan'],
    });
  }

  async getSubscriptionByCustomerId(
    customerId: string,
  ): Promise<InstructorSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { stripeCustomerId: customerId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSubscriptions() {
    return this.subscriptionRepository.find({
      relations: ['plan', 'instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateSubscriptionStatus(
    id: string,
    status: SubscriptionStatus,
  ): Promise<InstructorSubscription> {
    const subscription = await this.getSubscriptionById(id);
    subscription.status = status;
    return this.subscriptionRepository.save(subscription);
  }
}
