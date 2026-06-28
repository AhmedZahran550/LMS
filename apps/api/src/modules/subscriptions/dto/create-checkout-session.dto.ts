import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SubscriptionPlanType } from '@lms/shared-types';

export class CreateCheckoutSessionDto {
  @IsEnum(SubscriptionPlanType)
  planType!: SubscriptionPlanType;

  @IsString()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
