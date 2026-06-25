import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ContentType } from '@lms/shared-types';
import { Course } from '../../db/entities/course.entity';
import { BaseEntity } from './base.entity';

@Entity('course_content')
@Index(['courseId', 'orderIndex'])
export class CourseContent extends BaseEntity {
  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  url!: string;

  @Column()
  filename!: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.VIDEO,
  })
  contentType!: ContentType;

  @Column({ nullable: true })
  duration?: number; // in seconds, mainly for videos

  @Column('int')
  size!: number; // in bytes

  @Column()
  mimeType!: string;

  @Column({ default: 0 })
  orderIndex!: number;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;
}
