import { IsNotEmpty, IsOptional, IsString, IsUrl, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}
