import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import { User } from "../../../db/entities/user.entity";
import { AuthProvider, UserRole } from "@lms/shared-types";
import { UsersService } from "../../../modules/users/users.service";
import { SubscriptionService } from "../../../modules/subscriptions/services/subscription.service";

export interface SocialProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class SocialAuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async validateOrCreateUser(
    provider: AuthProvider,
    profile: SocialProfile,
    role?: string,
    client?: string,
  ) {
    let user = await this.usersRepository.findOne({
      where: { provider, providerId: profile.id },
    });
    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }
      if (client === 'web' && user.role === UserRole.LEARNER) {
        throw new UnauthorizedException('error.students_use_mobile');
      }
      const tokens = await this.generateTokens(user);
      return { ...tokens, needsRole: false };
    }

    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }
      if (client === 'web' && user.role === UserRole.LEARNER) {
        throw new UnauthorizedException('error.students_use_mobile');
      }
      user.provider = provider;
      user.providerId = profile.id;
      if (profile.picture && !user.profileImageUrl) {
        user.profileImageUrl = profile.picture;
      }
      user.isEmailVerified = true;
      await this.usersService.save(user);
      const tokens = await this.generateTokens(user);
      return { ...tokens, needsRole: false };
    }

    // New user — some flows provide a role upfront, others defer to /choose-role
    if (role) {
      const validRoles = Object.values(UserRole) as string[];
      if (!validRoles.includes(role)) {
        throw new BadRequestException('Invalid role');
      }
      if (client === 'web' && role === UserRole.LEARNER) {
        throw new UnauthorizedException('error.students_use_mobile');
      }
      const user = await this.createSocialUser(provider, profile, role as UserRole);
      const tokens = await this.generateTokens(user);
      return { ...tokens, needsRole: false };
    }

    // No role given → issue a temp token for /choose-role
    const tempToken = this.jwtService.sign(
      {
        temp: true,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        provider,
        providerId: profile.id,
        picture: profile.picture,
      },
      { expiresIn: '5m' },
    );

    return {
      tempToken,
      needsRole: true,
      user: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    };
  }

  async completeRegistration(tempToken: string, role: UserRole) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new BadRequestException('Invalid or expired registration token');
    }
    if (!payload.temp) {
      throw new BadRequestException('Invalid token type');
    }

    const user = await this.createSocialUser(
      payload.provider,
      {
        id: payload.providerId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        picture: payload.picture,
      },
      role,
    );

    const tokens = await this.generateTokens(user);
    return { ...tokens, needsRole: false };
  }

  private async createSocialUser(
    provider: AuthProvider,
    profile: SocialProfile,
    role: UserRole,
  ): Promise<User> {
    const hashedPassword = await argon2.hash(crypto.randomUUID());
    const user = await this.usersService.create({
      email: profile.email,
      password: hashedPassword,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role,
      isActive: true,
    });
    user.provider = provider;
    user.providerId = profile.id;
    user.profileImageUrl = profile.picture ?? null;
    user.isEmailVerified = true;
    return this.usersService.save(user);
  }

  private async generateTokens(user: User) {
    const lang = user.preferences?.lang || "ar";
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      lang,
      provider: user.provider,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("jwt.refreshSecret"),
      expiresIn: this.configService.get<string>("jwt.refreshExpiry"),
    });

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    let subscription: any = null;
    if (user.role === UserRole.INSTRUCTOR) {
      try {
        const usage = await this.subscriptionService.getUsage(user.id);
        if (usage) {
          subscription = {
            plan: usage.plan?.name || null,
            status: usage.subscription?.status || null,
            totalStudents: usage.totalStudents,
            totalStorageBytes: usage.totalStorageBytes,
            maxTotalStudents: usage.plan?.maxTotalStudents || 0,
            pricePerStudent: usage.plan?.pricePerStudent || 0,
            baseStorageBytes: usage.baseStorageBytes,
            totalAddonStorageBytes: usage.totalAddonStorageBytes,
          };
        }
      } catch {
        subscription = null;
      }
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      provider: user.provider,
      profileImageUrl: user.profileImageUrl,
      preferences: user.preferences || { lang: "ar", mode: "light" },
      createdAt: user.createdAt.toISOString(),
      subscription,
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
    };
  }
}
