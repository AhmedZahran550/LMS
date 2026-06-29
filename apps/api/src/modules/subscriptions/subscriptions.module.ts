import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import stripeConfig from '../../config/stripe.config';
import { SubscriptionPlan } from '../../db/entities/subscription-plan.entity';
import { InstructorSubscription } from '../../db/entities/instructor-subscription.entity';
import { Payment } from '../../db/entities/payment.entity';
import { Course } from '../../db/entities/course.entity';
import { CourseContent } from '../../db/entities/course-content.entity';
import { Enrollment } from '../../db/entities/enrollment.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionGuardService } from './services/subscription-guard.service';
import { StripeService } from './services/stripe.service';
import { InstructorSubscriptionsController } from './controllers/instructor-subscriptions.controller';
import { AdminSubscriptionsController } from './controllers/admin-subscriptions.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      InstructorSubscription,
      Payment,
      Course,
      CourseContent,
      Enrollment,
    ]),
    ConfigModule.forFeature(stripeConfig),
    UsersModule,
  ],
  controllers: [
    InstructorSubscriptionsController,
    AdminSubscriptionsController,
    StripeWebhookController,
  ],
  providers: [
    SubscriptionService,
    SubscriptionGuardService,
    StripeService,
  ],
  exports: [
    SubscriptionService,
    SubscriptionGuardService,
    StripeService,
  ],
})
export class SubscriptionsModule {}
