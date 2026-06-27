import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@lms/shared-types';

export class OAuthInitDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
