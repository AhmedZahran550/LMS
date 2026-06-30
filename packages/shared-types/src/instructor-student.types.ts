import { InstructorStudentStatus, InvitedBy } from './enums';

export interface InstructorStudentDto {
  id: string;
  instructorId: string;
  studentId: string;
  status: InstructorStudentStatus;
  invitedBy: InvitedBy;
  invitationSentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface CourseAssignmentDto {
  id: string;
  instructorStudentId: string;
  courseId: string;
  assignedAt: string;
}

export interface StorageAddonDto {
  id: string;
  instructorSubscriptionId: string;
  additionalBytes: number;
  stripePriceId: string | null;
  stripeInvoiceId: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface SystemConfigDto {
  key: string;
  value: string;
  description: string | null;
}

export interface StudentWithCoursesDto {
  student: InstructorStudentDto;
  courses: CourseAssignmentDto[];
}

export interface InstructorSearchResultDto {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}
