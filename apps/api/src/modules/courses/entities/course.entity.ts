import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { CourseVisibility } from '@lms/shared-types';
import { User } from '../../users/entities/user.entity';

@Entity()
@Index(['instructorId'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToMany('Video', 'course')
  videos!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
