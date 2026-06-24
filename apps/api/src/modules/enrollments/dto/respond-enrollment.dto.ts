import { IsEnum, IsNotEmpty } from 'class-validator';
import { EnrollmentStatus } from '@lms/shared-types';

export class RespondEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  @IsNotEmpty()
  status!: EnrollmentStatus;
}
