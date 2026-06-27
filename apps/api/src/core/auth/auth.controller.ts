import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Req, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthProvider } from '@lms/shared-types';
import { AuthService } from './auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { OAuthStateStore } from './services/oauth-state.store';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService,
    private readonly oauthStateStore: OAuthStateStore,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Get('google')
  async googleAuth(@Query('role') role: string, @Res() res: Response) {
    const state = this.oauthStateStore.save(role || 'learner');
    const config = this.configService.get('oauth.google') as {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email profile');
    url.searchParams.set('state', state);
    return res.redirect(url.toString());
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response, @Query('state') state: string) {
    const role = this.oauthStateStore.consume(state) || 'learner';
    const tokens = await this.socialAuthService.validateOrCreateUser(
      AuthProvider.GOOGLE,
      req.user,
      role,
    );
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(
      `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    );
  }

  @Get('facebook')
  async facebookAuth(@Query('role') role: string, @Res() res: Response) {
    const state = this.oauthStateStore.save(role || 'learner');
    const config = this.configService.get('oauth.facebook') as {
      appId: string;
      appSecret: string;
      callbackUrl: string;
    };
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.searchParams.set('client_id', config.appId);
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email,public_profile');
    url.searchParams.set('state', state);
    return res.redirect(url.toString());
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: any, @Res() res: Response, @Query('state') state: string) {
    const role = this.oauthStateStore.consume(state) || 'learner';
    const tokens = await this.socialAuthService.validateOrCreateUser(
      AuthProvider.FACEBOOK,
      req.user,
      role,
    );
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(
      `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    );
  }
}
