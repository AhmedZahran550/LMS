import { IsEnum, IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';
import { CourseVisibility } from '@lms/shared-types';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CourseVisibility)
  @IsOptional()
  visibility?: CourseVisibility;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
