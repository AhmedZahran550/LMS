import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('storage_plans')
export class StoragePlan extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  nameAr?: string;

  @Column()
  gigabytes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ default: 'egp' })
  currency!: string;

  @Column({ default: 90 })
  durationDays!: number; // 3 months validity

  @Column({ default: true })
  isActive!: boolean;
}
