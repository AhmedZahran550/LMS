import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StorageSubscriptionStatus } from '@lms/shared-types';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { StoragePlan } from './storage-plan.entity';

@Entity('storage_subscriptions')
@Index(['instructorId', 'status'])
export class StorageSubscription extends BaseEntity {
  @Column()
  instructorId!: string;

  @Column()
  storagePlanId!: string;

  @Column({
    type: 'enum',
    enum: StorageSubscriptionStatus,
    default: StorageSubscriptionStatus.ACTIVE,
  })
  status!: StorageSubscriptionStatus;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date; // 90 days after startDate

  @Column({ type: 'varchar', nullable: true })
  @Index()
  kashierOrderId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  kashierPaymentId?: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @ManyToOne(() => StoragePlan)
  @JoinColumn({ name: 'storagePlanId' })
  storagePlan!: StoragePlan;
}
