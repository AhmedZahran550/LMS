import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('storage_addons')
@Index(['instructorId', 'isActive'])
export class StorageAddon extends BaseEntity {
  @Column()
  instructorId!: string;

  @Column({ type: 'bigint' })
  additionalBytes!: string;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  kashierOrderId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  kashierPaymentId?: string | null;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date; // 90 days validity

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;
}
