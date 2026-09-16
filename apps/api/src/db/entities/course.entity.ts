import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { CourseContent } from "./course-content.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "./base.entity";

@Entity()
@Index(["instructorId"])
@Index(["categoryId"])
export class Course extends BaseEntity {
  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ default: "egp" })
  currency!: string;

  @Column({ nullable: true })
  categoryId?: string | null;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category?: Category | null;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  instructorId?: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "instructorId" })
  instructor?: User | null;

  @OneToMany(() => CourseContent, (content) => content.course)
  contents!: CourseContent[];

  @OneToMany("CoursePurchase", (purchase: any) => purchase.course)
  purchases!: any[];
}
