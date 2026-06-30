import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class SystemConfig extends BaseEntity {
  @Column({ unique: true })
  key!: string;

  @Column('text')
  value!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
