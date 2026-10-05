import { PurchaseStatus } from './enums';
import { CoursePublicResponse } from './course.types';

export interface CoursePurchaseDto {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  platformCommission: number;
  teacherRevenue: number;
  currency: string;
  kashierOrderId?: string | null;
  kashierPaymentId?: string | null;
  status: PurchaseStatus;
  purchasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  course?: CoursePublicResponse;
}

export interface StudentCourseListItemDto {
  purchaseId: string;
  purchasedAt: string;
  course: CoursePublicResponse;
}

export interface PurchaseInitiateResponseDto {
  isFree: boolean;
  purchaseId: string;
  checkoutUrl?: string;
  kashierOrderId?: string;
}

export interface InstructorCourseSaleDto {
  purchaseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  platformCommission: number;
  teacherRevenue: number;
  purchasedAt: string;
}

export interface InstructorRevenueSummaryDto {
  totalGrossRevenue: number;
  totalPlatformCommission: number;
  totalNetRevenue: number;
  totalSalesCount: number;
}
