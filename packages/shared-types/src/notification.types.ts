import { NotificationType } from './enums';

export interface NotificationDto {
  id: string;
  userId: string;
  subject: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  metadata?: Record<string, any>;
  createdAt: string;
}
