import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UploadSessionStatus } from '@lms/shared-types';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('upload_sessions')
@Index(['instructorId', 'status'])
@Index(['courseId', 'status'])
export class UploadSession extends BaseEntity {
  @Column()
  instructorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  fileName!: string;

  @Column('bigint')
  fileSize!: string;

  @Column()
  mimeType!: string;

  @Column({ default: 'courses' })
  folder!: string;

  @Column({ nullable: true })
  publicId?: string;

  @Column({ type: 'varchar', default: 'local' })
  provider!: 'cloudinary' | 'local';

  @Column({
    type: 'enum',
    enum: UploadSessionStatus,
    default: UploadSessionStatus.PENDING,
  })
  status!: UploadSessionStatus;

  @Column('bigint', { default: '0' })
  uploadedBytes!: string;

  @Column({ type: 'jsonb', nullable: true })
  uploadParams?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;
}
