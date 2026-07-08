import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { InstructorStudentStatus, InvitedBy } from '@lms/shared-types';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['instructorId', 'status'])
@Index(['studentId', 'status'])
@Index(['instructorId', 'studentId'], { unique: true, where: '"studentId" IS NOT NULL' })
export class InstructorStudent extends BaseEntity {
  @Column()
  instructorId!: string;

  @Column({ nullable: true })
  studentId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  invitedEmail?: string | null;

  @Column({
    type: 'enum',
    enum: InstructorStudentStatus,
    default: InstructorStudentStatus.INVITED,
  })
  status!: InstructorStudentStatus;

  @Column({
    type: 'enum',
    enum: InvitedBy,
    default: InvitedBy.INSTRUCTOR,
  })
  invitedBy!: InvitedBy;

  @Column({ type: 'varchar', nullable: true })
  invitationToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invitationSentAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: User | null;
}
