import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InstructorSubscription } from './instructor-subscription.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class StorageAddon extends BaseEntity {
  @Column()
  instructorSubscriptionId!: string;

  @Column({ type: 'bigint' })
  additionalBytes!: string;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeInvoiceId?: string | null;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => InstructorSubscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorSubscriptionId' })
  instructorSubscription!: InstructorSubscription;
}
