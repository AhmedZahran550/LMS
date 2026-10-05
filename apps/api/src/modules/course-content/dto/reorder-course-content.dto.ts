import { IsArray, IsOptional, IsString } from 'class-validator';

export class ReorderCourseContentDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videoIds?: string[];
}

export { ReorderCourseContentDto as ReorderVideosDto };
