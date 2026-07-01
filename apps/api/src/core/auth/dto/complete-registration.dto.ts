import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole, ClientType } from '@lms/shared-types';

export class CompleteRegistrationDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(ClientType)
  client?: ClientType;
}
