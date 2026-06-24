import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { CourseVisibility } from '@lms/shared-types';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(CourseVisibility)
  @IsOptional()
  visibility?: CourseVisibility;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}
