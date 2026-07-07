import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches, MaxLength } from 'class-validator';
import { UserRole, ClientType } from '@lms/shared-types';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Mobile number must be in valid E.164 format (e.g. +201234567890)' })
  mobileNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(ClientType)
  client?: ClientType;
}
