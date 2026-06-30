import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { InstructorStudent } from './instructor-student.entity';
import { Course } from './course.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['instructorStudentId'])
@Index(['courseId'])
@Index(['instructorStudentId', 'courseId'], { unique: true })
export class CourseAssignment extends BaseEntity {
  @Column()
  instructorStudentId!: string;

  @Column()
  courseId!: string;

  @CreateDateColumn()
  assignedAt!: Date;

  @ManyToOne(() => InstructorStudent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructorStudentId' })
  instructorStudent!: InstructorStudent;

  @ManyToOne(() => Course, (course) => course.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;
}
