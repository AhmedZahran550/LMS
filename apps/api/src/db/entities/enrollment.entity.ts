import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EnrollmentStatus } from '@lms/shared-types';
import { User } from '../../db/entities/user.entity';
import { Course } from '../../db/entities/course.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['learnerId', 'courseId'], { unique: true })
export class Enrollment extends BaseEntity {
  @Column()
  learnerId!: string;

  @Column()
  courseId!: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status!: EnrollmentStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner!: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @CreateDateColumn()
  requestedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date;
}
