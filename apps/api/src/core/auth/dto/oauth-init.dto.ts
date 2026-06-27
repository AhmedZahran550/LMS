import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@lms/shared-types';

export class OAuthInitDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
