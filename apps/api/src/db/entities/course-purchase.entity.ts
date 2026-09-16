import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PurchaseStatus } from '@lms/shared-types';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('course_purchases')
@Index(['studentId', 'courseId'], { unique: true })
@Index(['studentId', 'status'])
@Index(['courseId', 'status'])
export class CoursePurchase extends BaseEntity {
  @Column()
  studentId!: string;

  @Column()
  courseId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformCommission!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  teacherRevenue!: number;

  @Column({ default: 'egp' })
  currency!: string;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  kashierOrderId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  kashierPaymentId?: string | null;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status!: PurchaseStatus;

  @Column({ type: 'timestamp', nullable: true })
  purchasedAt?: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @ManyToOne(() => Course, (course) => course.purchases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;
}
