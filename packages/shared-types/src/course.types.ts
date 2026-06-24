import { CourseVisibility } from './enums';
import { UserProfile } from './user.types';

export interface CourseDto {
  id: string;
  title: string;
  description: string;
  visibility: CourseVisibility;
  thumbnailUrl?: string;
  isActive: boolean;
  instructorId: string;
  instructor?: UserProfile;
  createdAt: string;
}
