import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../db/entities/notification.entity';
import { NotificationType } from '@lms/shared-types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
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
    return this.notificationsRepository.save(notification);
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
    return this.notificationsRepository.save(notifications);
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
