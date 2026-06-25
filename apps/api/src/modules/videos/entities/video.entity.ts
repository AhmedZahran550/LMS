import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ContentType } from '@lms/shared-types';
import { Course } from '../../courses/entities/course.entity';

@Entity('video') // Keep existing table name; migration will add column
@Index(['courseId', 'orderIndex'])
export class CourseContent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  url!: string;

  @Column()
  filename!: string;

  @Column()
  mimeType!: string;

  @Column('int')
  size!: number;

  @Column('int')
  orderIndex!: number;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.VIDEO,
  })
  contentType!: ContentType;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
