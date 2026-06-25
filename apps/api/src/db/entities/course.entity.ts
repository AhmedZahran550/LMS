import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CourseVisibility } from '@lms/shared-types';
import { User } from '../../db/entities/user.entity';
import { CourseContent } from './course-content.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['instructorId'])
export class Course extends BaseEntity {
  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: CourseVisibility,
    default: CourseVisibility.PRIVATE,
  })
  visibility!: CourseVisibility;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  instructorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor!: User;

  @OneToMany(() => CourseContent, (content) => content.course)
  contents!: CourseContent[];
}
