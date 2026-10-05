import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { FacultyData } from '@lms/shared-types';

export class UpdateUniversityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsArray()
  faculties?: FacultyData[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
