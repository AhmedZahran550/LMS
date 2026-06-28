import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SubscriptionStatus } from '@lms/shared-types';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class InstructorSubscription extends BaseEntity {
  @Column()
  instructorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @Column()
  planId!: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'planId' })
  plan!: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  trialEndDate?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId?: string | null;

  @Column({ default: true })
  autoRenew!: boolean;
}
