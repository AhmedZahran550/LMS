import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
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
  maxTotalStudents!: number;

  @Column({ default: 0 })
  pricePerStudent!: number;

  @Column({ type: 'bigint', default: 0 })
  baseStorageBytes!: string;

  @Column({ default: 0 })
  trialDays!: number;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId?: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  computePrice() {
    this.price = this.maxTotalStudents * this.pricePerStudent;
  }
}
