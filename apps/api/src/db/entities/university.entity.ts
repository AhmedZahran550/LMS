import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FacultyData } from '@lms/shared-types';
import { User } from './user.entity';

@Entity('universities')
export class University extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name!: string;

  @Column()
  nameAr!: string;

  @Column('jsonb', { default: [] })
  faculties!: FacultyData[];

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => User, (user) => user.university)
  users!: User[];
}
