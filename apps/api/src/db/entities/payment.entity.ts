import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentStatus } from '@lms/shared-types';
import { InstructorSubscription } from './instructor-subscription.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Payment extends BaseEntity {
  @Column()
  instructorSubscriptionId!: string;

  @ManyToOne(() => InstructorSubscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorSubscriptionId' })
  instructorSubscription!: InstructorSubscription;

  @Column({ default: 0 })
  amount!: number;

  @Column({ default: 'usd' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar' })
  stripePaymentIntentId!: string;

  @Column({ type: 'varchar', nullable: true })
  stripeInvoiceId?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
