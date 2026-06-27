import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import { User } from "../../../db/entities/user.entity";
import { AuthProvider } from "@lms/shared-types";
import { UsersService } from "../../../modules/users/users.service";

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
  ) {}

  async validateOrCreateUser(
    provider: AuthProvider,
    profile: SocialProfile,
    role: string,
  ) {
    let user = await this.usersRepository.findOne({
      where: { provider, providerId: profile.id },
    });
    if (user) {
      return this.generateTokens(user);
    }

    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      user.provider = provider;
      user.providerId = profile.id;
      if (profile.picture && !user.profileImageUrl) {
        user.profileImageUrl = profile.picture;
      }
      user.isEmailVerified = true;
      await this.usersService.save(user);
      return this.generateTokens(user);
    }

    const hashedPassword = await argon2.hash(crypto.randomUUID());
    user = await this.usersService.create({
      email: profile.email,
      password: hashedPassword,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: role as any,
      isActive: true,
    });
    user.provider = provider;
    user.providerId = profile.id;
    user.profileImageUrl = profile.picture ?? null;
    user.isEmailVerified = true;
    await this.usersService.save(user);

    return this.generateTokens(user);
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
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
    };
  }
}
