import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity()
@Index(['courseId', 'orderIndex'])
export class Video {
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
