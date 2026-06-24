import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderVideosDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  videoIds!: string[];
}
