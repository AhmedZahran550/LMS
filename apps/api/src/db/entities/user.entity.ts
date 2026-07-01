import { Entity, Column, Unique } from 'typeorm';
import { UserRole, AuthProvider } from '@lms/shared-types';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';

@Entity()
@Unique(['provider', 'providerId'])
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider!: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  providerId?: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.LEARNER,
  })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  emailVerificationToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationOtpExpiresAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetPasswordToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpiresAt?: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  hashedRefreshToken?: string | null;

  @Column('jsonb', { default: { lang: 'ar', mode: 'light' } })
  preferences!: { lang: 'ar' | 'en'; mode: 'light' | 'dark' };

  @Column({ default: false })
  hasUsedFreePlan!: boolean;
}
