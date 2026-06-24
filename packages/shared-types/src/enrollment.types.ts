import { EnrollmentStatus } from './enums';
import { UserProfile } from './user.types';
import { CourseDto } from './course.types';

export interface EnrollmentDto {
  id: string;
  learnerId: string;
  courseId: string;
  status: EnrollmentStatus;
  learner?: UserProfile;
  course?: CourseDto;
  requestedAt: string;
  respondedAt?: string;
}
