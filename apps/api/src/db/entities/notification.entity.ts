import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { NotificationType } from '@lms/shared-types';
import { User } from '../../db/entities/user.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['userId', 'isRead'])
export class Notification extends BaseEntity {
  @Column()
  userId!: string;

  @Column()
  subject!: string;

  @Column('text')
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  relatedEntityType?: string;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
