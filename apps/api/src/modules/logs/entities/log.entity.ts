import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  method!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  statusCode!: number;

  @Column()
  responseTime!: number; // in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  requestBody?: any;

  @CreateDateColumn()
  createdAt!: Date;
}
