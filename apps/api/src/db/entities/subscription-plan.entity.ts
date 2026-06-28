import { Entity, Column } from 'typeorm';
import { SubscriptionPlanType } from '@lms/shared-types';
import { BaseEntity } from './base.entity';

@Entity()
export class SubscriptionPlan extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SubscriptionPlanType,
    default: SubscriptionPlanType.FREE,
  })
  name!: SubscriptionPlanType;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ default: 0 })
  price!: number;

  @Column({ default: 'usd' })
  currency!: string;

  @Column({ default: 0 })
  maxCourses!: number;

  @Column({ default: 0 })
  maxStudentsPerCourse!: number;

  @Column({ type: 'bigint', default: 0 })
  maxStorageBytes!: number;

  @Column({ default: 0 })
  trialDays!: number;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId?: string | null;

  @Column({ default: true })
  isActive!: boolean;
}
