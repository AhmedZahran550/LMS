import { ApiProperty } from '@nestjs/swagger';
import { UploadSessionStatus } from '@lms/shared-types';

export class UploadSessionResponseDto {
  @ApiProperty({ description: 'Unique upload session ID', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' })
  sessionId!: string;

  @ApiProperty({ description: 'Target storage provider', enum: ['cloudinary', 'local'], example: 'cloudinary' })
  provider!: 'cloudinary' | 'local';

  @ApiProperty({ description: 'Target URL to upload chunks directly to', example: 'https://api.cloudinary.com/v1_1/my-cloud/video/upload' })
  uploadUrl!: string;

  @ApiProperty({ description: 'HTTP method to use when uploading chunk', example: 'POST' })
  httpMethod!: string;

  @ApiProperty({ description: 'Recommended chunk size in bytes (e.g. 10MB)', example: 10485760 })
  chunkSize!: number;

  @ApiProperty({ description: 'Total declared file bytes', example: 104857600 })
  totalBytes!: number;

  @ApiProperty({ description: 'Pre-signed fields/parameters required in upload form body', required: false })
  fields?: Record<string, any>;

  @ApiProperty({ description: 'Required headers to include with chunk requests', required: false })
  headers?: Record<string, string>;

  @ApiProperty({ description: 'Pre-assigned public ID or object key', required: false })
  publicId?: string;
}

export class UploadStatusResponseDto {
  @ApiProperty({ description: 'Upload session ID' })
  sessionId!: string;

  @ApiProperty({ enum: UploadSessionStatus, description: 'Session status' })
  status!: UploadSessionStatus;

  @ApiProperty({ description: 'Total file size in bytes' })
  totalBytes!: number;

  @ApiProperty({ description: 'Bytes uploaded so far' })
  uploadedBytes!: number;

  @ApiProperty({ description: 'Next byte offset to resume from' })
  nextByteOffset!: number;

  @ApiProperty({ description: 'Progress percentage (0 - 100)' })
  percentage!: number;
}
