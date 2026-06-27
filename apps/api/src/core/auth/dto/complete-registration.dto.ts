import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '@lms/shared-types';

export class CompleteRegistrationDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
