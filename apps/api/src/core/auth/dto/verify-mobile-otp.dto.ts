import { IsNotEmpty, IsString, IsEnum, Matches, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType } from '@lms/shared-types';
import { DeviceInfo } from './login.dto';

export class VerifyMobileOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Mobile number must be in valid E.164 format (e.g. +201234567890)' })
  mobileNumber!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;

  @IsEnum(ClientType)
  @IsNotEmpty()
  client!: ClientType;

  @IsString()
  @IsOptional()
  deviceToken?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfo)
  deviceInfo?: DeviceInfo;
}
