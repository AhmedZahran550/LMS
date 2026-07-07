import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { ClientType } from '@lms/shared-types';

export class SendMobileOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Mobile number must be in valid E.164 format (e.g. +201234567890)' })
  mobileNumber!: string;

  @IsEnum(ClientType)
  @IsNotEmpty()
  client!: ClientType;
}
