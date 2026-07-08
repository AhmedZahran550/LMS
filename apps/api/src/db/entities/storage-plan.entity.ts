import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class StoragePlan extends BaseEntity {
  @Column()
  gigabytes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerGb!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice!: number;

  @Column({ default: true })
  isActive!: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  computePrice() {
    this.totalPrice = this.gigabytes * this.pricePerGb;
  }
}
