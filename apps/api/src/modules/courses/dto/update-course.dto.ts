import { IsOptional, IsString, IsUrl, IsBoolean, IsNumber, Min, IsUUID } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
