import { Entity, Column, Unique, OneToMany, Index } from "typeorm";
import { DeviceToken } from "./device-token.entity";
import { UserRole, AuthProvider } from "@lms/shared-types";
import { Exclude } from "class-transformer";
import { BaseEntity } from "./base.entity";

@Entity()
@Unique(["provider", "providerId"])
@Index(["mobileNumber"], { unique: true, where: '"isMobileVerified" = true' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  mobileNumber?: string | null;

  @Column({ default: false })
  isMobileVerified!: boolean;

  @Column({ type: "varchar", nullable: true, select: false })
  @Exclude()
  mobileOtp?: string | null;

  @Column({ type: "timestamp", nullable: true, select: false })
  mobileOtpExpiresAt?: Date | null;

  @Column({ select: false })
  @Exclude()
  password!: string;

  @Column({
    type: "enum",
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    select: false,
  })
  @Exclude()
  provider!: AuthProvider;

  @Column({ type: "varchar", nullable: true, select: false })
  @Exclude()
  providerId?: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.LEARNER,
  })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ type: "varchar", nullable: true, select: false })
  @Exclude()
  emailVerificationToken?: string | null;

  @Column({ type: "timestamp", nullable: true, select: false })
  @Exclude()
  emailVerificationOtpExpiresAt?: Date | null;

  @Column({ type: "varchar", nullable: true, select: false })
  @Exclude()
  resetPasswordToken?: string | null;

  @Column({ type: "timestamp", nullable: true, select: false })
  @Exclude()
  resetPasswordTokenExpiresAt?: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "varchar", nullable: true })
  profileImageUrl?: string | null;

  @Column({ type: "varchar", nullable: true, select: false })
  @Exclude()
  hashedRefreshToken?: string | null;

  @Column("jsonb", { default: { lang: "ar", mode: "light" } })
  preferences!: { lang: "ar" | "en"; mode: "light" | "dark" };

  @Column({ default: false })
  hasUsedFreePlan!: boolean;

  @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user)
  @Exclude()
  deviceTokens!: DeviceToken[];
}
