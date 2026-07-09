import { IsString, IsObject, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TestPushNotificationDto {
  @ApiProperty({ description: 'The ID of the user to send the push notification to' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Title of the push notification', example: 'Test Notification' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Body content of the push notification', example: 'This is a test push notification sent by an admin.' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ description: 'Type of the notification (used by the mobile app for routing)', example: 'SYSTEM_ALERT' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ description: 'Optional key-value pairs for additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
