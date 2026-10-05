import { Entity, Column, OneToMany, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name!: string;

  @Column()
  nameAr!: string;

  @Column({ unique: true })
  @Index()
  slug!: string;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Course, (course) => course.category)
  courses!: Course[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
}
