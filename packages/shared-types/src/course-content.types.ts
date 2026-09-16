import { ContentType } from './enums';

export interface CourseContentDto {
  id: string;
  title: string;
  description?: string;
  url: string;
  filename: string;
  mimeType: string;
  contentType?: ContentType;
  duration?: number;
  size: number;
  orderIndex: number;
  courseId: string;
  isPreview?: boolean;
  createdAt: string;
}

// Backward-compatible type alias
export type VideoDto = CourseContentDto;
