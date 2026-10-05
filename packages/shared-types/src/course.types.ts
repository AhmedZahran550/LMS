import { CourseVisibility } from './enums';
import { UserProfile } from './user.types';
import { CategoryResponseDto } from './category.types';
import { CourseContentDto } from './course-content.types';

export interface CourseDto {
  id: string;
  title: string;
  description: string;
  visibility?: CourseVisibility;
  price: number;
  currency: string;
  categoryId?: string | null;
  category?: CategoryResponseDto | null;
  thumbnailUrl?: string;
  isActive: boolean;
  instructorId: string;
  instructor?: UserProfile;
  contents?: CourseContentDto[];
  createdAt: string;
}

export interface CoursePublicResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId?: string | null;
  category?: CategoryResponseDto | null;
  thumbnailUrl?: string;
  isActive: boolean;
  instructorId: string;
  instructor?: Partial<UserProfile>;
  previewContents?: CourseContentDto[];
  totalLessons?: number;
  createdAt: string;
}

