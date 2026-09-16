import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateStoragePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  gigabytes!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStoragePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  gigabytes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SubscribeStoragePlanDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;
}
