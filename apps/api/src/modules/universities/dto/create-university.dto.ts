import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { FacultyData } from '@lms/shared-types';

export class CreateUniversityDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  nameAr!: string;

  @IsArray()
  @IsNotEmpty()
  faculties!: FacultyData[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
