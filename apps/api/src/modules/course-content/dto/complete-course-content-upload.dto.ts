import { IsNotEmpty, IsUUID, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloudinaryResultDto {
  @ApiProperty({ description: 'Cloudinary public_id', example: 'courses/123/uuid' })
  @IsNotEmpty()
  @IsString()
  publicId!: string;

  @ApiProperty({ description: 'Cloudinary secure URL', example: 'https://res.cloudinary.com/demo/video/upload/v1234/sample.mp4' })
  @IsNotEmpty()
  @IsString()
  secureUrl!: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  bytes?: number;

  @ApiProperty({ description: 'Cloudinary resource type (video, image, raw)', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'File format (mp4, pdf, etc.)', required: false })
  @IsOptional()
  @IsString()
  format?: string;
}

export class CompleteCourseContentUploadDto {
  @ApiProperty({ description: 'Upload session UUID returned from /upload-session' })
  @IsNotEmpty()
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ description: 'Content title' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Optional content description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether this content is a preview lesson', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @ApiProperty({ description: 'Cloudinary result object (when uploading directly to Cloudinary in production)', required: false, type: CloudinaryResultDto })
  @IsOptional()
  @IsObject()
  cloudinaryResult?: CloudinaryResultDto;
}
