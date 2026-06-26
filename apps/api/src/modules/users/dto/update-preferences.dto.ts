import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @IsIn(['ar', 'en'])
  lang?: 'ar' | 'en';

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  mode?: 'light' | 'dark';
}
