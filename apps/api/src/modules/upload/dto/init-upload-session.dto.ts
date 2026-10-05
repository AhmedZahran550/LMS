import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitUploadSessionDto {
  @ApiProperty({ description: 'Original file name with extension', example: 'lecture-01.mp4' })
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @ApiProperty({ description: 'Total file size in bytes', example: 104857600 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fileSize!: number;

  @ApiProperty({ description: 'MIME type of the file', example: 'video/mp4' })
  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  @ApiProperty({ description: 'Content title', example: 'Introduction to Algorithms' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Optional content description', required: false, example: 'Covers Big-O notation' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether this content is a free preview', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}
