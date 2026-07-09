import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../db/entities/notification.entity';
import { NotificationType } from '@lms/shared-types';
import { PushNotificationService } from '../push-notifications/push-notifications.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private pushService: PushNotificationService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    subject: string,
    message: string,
    metadata?: Record<string, any>,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      subject,
      message,
      metadata,
      relatedEntityType,
      relatedEntityId,
    });
    const saved = await this.notificationsRepository.save(notification);

    // Fire-and-forget push — don't await to keep API fast
    this.pushService.sendToUser(userId, {
      title: subject,
      body: message,
      type,
      data: {
        notificationId: saved.id,
        ...(relatedEntityType ? { relatedEntityType } : {}),
        ...(relatedEntityId ? { relatedEntityId } : {}),
        ...(metadata
          ? Object.fromEntries(
              Object.entries(metadata).map(([k, v]) => [k, String(v)]),
            )
          : {}),
      },
    }).catch((err) => this.logger.error('Push notification failed', err));

    return saved;
  }

  async createMany(
    userIds: string[],
    type: NotificationType,
    subject: string,
    message: string,
    metadata?: Record<string, any>,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<Notification[]> {
    const notifications = userIds.map(userId =>
      this.notificationsRepository.create({
        userId,
        type,
        subject,
        message,
        metadata,
        relatedEntityType,
        relatedEntityId,
      })
    );
    const saved = await this.notificationsRepository.save(notifications);

    // Fire-and-forget push to all recipients
    this.pushService.sendToUsers(userIds, {
      title: subject,
      body: message,
      type,
      data: {
        ...(relatedEntityType ? { relatedEntityType } : {}),
        ...(relatedEntityId ? { relatedEntityId } : {}),
        ...(metadata
          ? Object.fromEntries(
              Object.entries(metadata).map(([k, v]) => [k, String(v)]),
            )
          : {}),
      },
    }).catch((err) => this.logger.error('Bulk push notification failed', err));

    return saved;
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id, userId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }
}
