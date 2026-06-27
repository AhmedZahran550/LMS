export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  LEARNER = 'learner',
}

export enum CourseVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum NotificationType {
  NEW_CONTENT = 'new_content',
  ENROLLMENT_REQUEST = 'enrollment_request',
  ENROLLMENT_RESPONSE = 'enrollment_response',
}

export enum ContentType {
  VIDEO = 'video',
  PDF = 'pdf',
  IMAGE = 'image',
  PRESENTATION = 'presentation',
}
