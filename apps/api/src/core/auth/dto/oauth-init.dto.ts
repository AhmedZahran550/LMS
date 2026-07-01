import { IsEnum, IsOptional } from 'class-validator';
import { UserRole, ClientType } from '@lms/shared-types';

export class OAuthInitDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(ClientType)
  client?: ClientType;
}
