import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCourseContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isPreview?: boolean;
}

export { UpdateCourseContentDto as UpdateVideoDto };
