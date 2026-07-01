import { SubscriptionPlanType, SubscriptionStatus, PaymentStatus } from './enums';

export interface SubscriptionPlanDto {
  id: string;
  name: SubscriptionPlanType;
  description: string;
  price: number;
  currency: string;
  maxTotalStudents: number;
  pricePerStudent: number;
  baseStorageBytes: number;
  trialDays: number;
  stripePriceId: string | null;
  isActive: boolean;
}

export interface InstructorSubscriptionDto {
  id: string;
  instructorId: string;
  planId: string;
  plan: SubscriptionPlanDto;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  autoRenew: boolean;
}

export interface PaymentDto {
  id: string;
  instructorSubscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  stripeInvoiceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface SubscriptionUsageDto {
  plan: SubscriptionPlanDto;
  subscription: InstructorSubscriptionDto;
  totalStudents: number;
  totalStorageBytes: number;
  baseStorageBytes: number;
  totalAddonStorageBytes: number;
}
