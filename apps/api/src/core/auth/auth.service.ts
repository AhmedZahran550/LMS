import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { UsersService } from '../../modules/users/users.service';
import { MailService } from '../../modules/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { User } from '../../db/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    user.isEmailVerified = false;
    user.emailVerificationToken = emailVerificationToken;
    await this.usersService.save(user);
    try {
      const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
      const verifyUrl = frontendUrl + '/verify-email?token=' + emailVerificationToken;
      this.mailService.sendVerificationEmail(user.email, verifyUrl);
    } catch (error) {
      console.log('error in verification email', error);
    }

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await argon2.verify(user.password, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await argon2.verify(
        user.hashedRefreshToken,
        refreshTokenDto.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyEmail({ token }: VerifyEmailDto) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersService.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerification({ email }: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await this.usersService.save(user);

    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const verifyUrl = frontendUrl + '/verify-email?token=' + emailVerificationToken;
    await this.mailService.sendVerificationEmail(user.email, verifyUrl);

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If an account exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = expiresAt;
    await this.usersService.save(user);

    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const resetUrl = frontendUrl + '/reset-password?token=' + resetToken;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'If an account exists, a password reset link has been sent.' };
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(token);

    if (!user || !user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    user.password = await argon2.hash(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiresAt = null;
    await this.usersService.save(user);

    return { message: 'Password reset successfully' };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true };
  }

  private async generateTokens(user: User) {
    const lang = user.preferences?.lang || 'ar';
    const payload = { sub: user.id, email: user.email, role: user.role, lang };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiry'),
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
      profileImageUrl: user.profileImageUrl,
      preferences: user.preferences || { lang: 'ar', mode: 'light' },
      createdAt: user.createdAt.toISOString(),
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
    };
  }
}
