import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { RegisterDto } from "../core/auth/dto/register.dto";
import { LoginDto } from "../core/auth/dto/login.dto";
import { VerifyEmailDto } from "../core/auth/dto/verify-email.dto";
import { SendOtpDto } from "../core/auth/dto/send-otp.dto";
import { ForgotPasswordDto } from "../core/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "../core/auth/dto/reset-password.dto";
import { RefreshTokenDto } from "../core/auth/dto/refresh-token.dto";
import { SendMobileOtpDto } from "../core/auth/dto/send-mobile-otp.dto";
import { VerifyMobileOtpDto } from "../core/auth/dto/verify-mobile-otp.dto";
import { OAuthInitDto } from "../core/auth/dto/oauth-init.dto";
import { CompleteRegistrationDto } from "../core/auth/dto/complete-registration.dto";

export const AuthSwagger = {
  register: () =>
    applyDecorators(
      ApiOperation({ summary: "Register a new user", description: "Creates a new user account with email and password." }),
      ApiBody({ type: RegisterDto }),
      ApiResponse({ status: 201, description: "User registered successfully" }),
      ApiResponse({ status: 400, description: "Validation failed or email already exists" }),
    ),

  login: () =>
    applyDecorators(
      ApiOperation({ summary: "Login with credentials", description: "Authenticates a user and returns JWT tokens." }),
      ApiBody({ type: LoginDto }),
      ApiResponse({ status: 200, description: "Login successful, returns tokens" }),
      ApiResponse({ status: 401, description: "Invalid credentials" }),
    ),

  verifyEmail: () =>
    applyDecorators(
      ApiOperation({ summary: "Verify email address", description: "Verifies user email using OTP code." }),
      ApiBody({ type: VerifyEmailDto }),
      ApiResponse({ status: 200, description: "Email verified successfully" }),
      ApiResponse({ status: 400, description: "Invalid or expired OTP" }),
    ),

  sendOtp: () =>
    applyDecorators(
      ApiOperation({ summary: "Send OTP to email", description: "Sends a 6-digit OTP code to the provided email address." }),
      ApiBody({ type: SendOtpDto }),
      ApiResponse({ status: 200, description: "OTP sent successfully" }),
      ApiResponse({ status: 429, description: "Rate limit exceeded" }),
    ),

  sendMobileOtp: () =>
    applyDecorators(
      ApiOperation({ summary: "Send Mobile OTP", description: "Sends a 6-digit OTP code to the provided mobile number." }),
      ApiBody({ type: SendMobileOtpDto }),
      ApiResponse({ status: 200, description: "Mobile OTP sent successfully" }),
      ApiResponse({ status: 429, description: "Rate limit exceeded" }),
    ),

  verifyMobileOtp: () =>
    applyDecorators(
      ApiOperation({ summary: "Verify mobile OTP and login", description: "Verifies mobile OTP and returns JWT tokens." }),
      ApiBody({ type: VerifyMobileOtpDto }),
      ApiResponse({ status: 200, description: "Mobile OTP verified successfully, returns tokens" }),
      ApiResponse({ status: 400, description: "Invalid or expired OTP" }),
    ),

  forgotPassword: () =>
    applyDecorators(
      ApiOperation({ summary: "Request password reset", description: "Sends a password reset link to the user's email." }),
      ApiBody({ type: ForgotPasswordDto }),
      ApiResponse({ status: 200, description: "Reset email sent if account exists" }),
    ),

  resetPassword: () =>
    applyDecorators(
      ApiOperation({ summary: "Reset password", description: "Resets the user password using a reset token." }),
      ApiBody({ type: ResetPasswordDto }),
      ApiResponse({ status: 200, description: "Password reset successfully" }),
      ApiResponse({ status: 400, description: "Invalid or expired token" }),
    ),

  refresh: () =>
    applyDecorators(
      ApiOperation({ summary: "Refresh access token", description: "Exchanges a refresh token for a new access token." }),
      ApiBody({ type: RefreshTokenDto }),
      ApiResponse({ status: 200, description: "Tokens refreshed successfully" }),
      ApiResponse({ status: 401, description: "Invalid or expired refresh token" }),
    ),

  logout: () =>
    applyDecorators(
      ApiOperation({ summary: "Logout user", description: "Invalidates the user's refresh token." }),
      ApiBearerAuth(),
      ApiResponse({ status: 200, description: "Logged out successfully" }),
      ApiResponse({ status: 401, description: "Unauthorized" }),
    ),

  googleAuth: () =>
    applyDecorators(
      ApiOperation({ summary: "Google OAuth login", description: "Redirects user to Google OAuth consent screen." }),
      ApiQuery({ type: OAuthInitDto }),
      ApiResponse({ status: 302, description: "Redirect to Google" }),
    ),

  googleAuthRedirect: () =>
    applyDecorators(
      ApiOperation({ summary: "Google OAuth callback", description: "Handles Google OAuth callback and returns auth result via postMessage." }),
      ApiResponse({ status: 200, description: "OAuth success HTML page" }),
    ),

  facebookAuth: () =>
    applyDecorators(
      ApiOperation({ summary: "Facebook OAuth login", description: "Redirects user to Facebook OAuth dialog." }),
      ApiQuery({ type: OAuthInitDto }),
      ApiResponse({ status: 302, description: "Redirect to Facebook" }),
    ),

  facebookAuthRedirect: () =>
    applyDecorators(
      ApiOperation({ summary: "Facebook OAuth callback", description: "Handles Facebook OAuth callback and returns auth result via postMessage." }),
      ApiResponse({ status: 200, description: "OAuth success HTML page" }),
    ),

  completeRegistration: () =>
    applyDecorators(
      ApiOperation({ summary: "Complete OAuth registration", description: "Completes registration for OAuth users by selecting a role." }),
      ApiBody({ type: CompleteRegistrationDto }),
      ApiResponse({ status: 200, description: "Registration completed successfully" }),
      ApiResponse({ status: 400, description: "Invalid temp token" }),
    ),
};
