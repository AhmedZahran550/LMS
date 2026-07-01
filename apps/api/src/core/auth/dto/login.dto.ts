import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType } from '@lms/shared-types';

export class DeviceInfo {
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  deviceType!: string;

  @IsString()
  @IsOptional()
  osVersion?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password!: string;

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
