import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { DeviceToken } from '../../db/entities/device-token.entity';
import { Notification } from '../../db/entities/notification.entity';
import { PushPayload } from './push-payload.interface';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private isEnabled = false;
  private firebaseApp: App | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(DeviceToken)
    private deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────

  onModuleInit() {
    const serviceAccountJson = this.configService.get<string>('firebase.serviceAccountJson');
    if (!serviceAccountJson) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled',
      );
      return;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      this.isEnabled = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  // ─── Public API ───────────────────────────────────────────

  /**
   * Send a hybrid push notification to a single user's devices.
   * Includes the user's unread badge count in the data payload.
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.isEnabled) return;

    const [tokens, unreadCount] = await Promise.all([
      this.getDeviceTokens(userId),
      this.getUnreadCount(userId),
    ]);

    if (tokens.length === 0) return;

    const message = this.buildMulticastMessage(tokens, payload, unreadCount);
    await this.sendMulticastBatched(message, tokens);
  }

  /**
   * Send a hybrid push notification to multiple users' devices.
   * Uses a shared unread count placeholder — mobile app should
   * refresh its own badge on receipt.
   */
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    if (!this.isEnabled || userIds.length === 0) return;

    const tokenRecords = await this.deviceTokenRepo.find({
      where: { user: { id: In(userIds) } },
      select: ['deviceToken'],
    });

    const tokens = tokenRecords.map((t) => t.deviceToken);
    if (tokens.length === 0) return;

    // For bulk sends we don't compute per-user badge —
    // mobile app refreshes its own count on notification receipt.
    const message = this.buildMulticastMessage(tokens, payload);
    await this.sendMulticastBatched(message, tokens);
  }

  /**
   * Send a hybrid push to all devices subscribed to a topic.
   * Topic naming convention: 'role_instructor', 'role_learner', 'role_admin'.
   */
  async sendToTopic(topic: string, payload: PushPayload): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await getMessaging(this.firebaseApp!).send({
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          type: payload.type,
          ...(payload.data ?? {}),
        },
        // Platform-specific overrides
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
      this.logger.log(`Topic push sent to "${topic}"`);
    } catch (error) {
      this.logger.error(`Topic push to "${topic}" failed`, error);
    }
  }

  /**
   * Subscribe device tokens to a topic.
   * Called during login/token registration to join role-based topics.
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isEnabled || tokens.length === 0) return;

    try {
      const response = await getMessaging(this.firebaseApp!).subscribeToTopic(tokens, topic);
      if (response.failureCount > 0) {
        this.logger.warn(
          `Topic subscribe partial failure: ${response.failureCount}/${tokens.length} for "${topic}"`,
        );
      }
    } catch (error) {
      this.logger.error(`Topic subscribe failed for "${topic}"`, error);
    }
  }

  /**
   * Unsubscribe device tokens from a topic.
   * Called during logout or role changes.
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isEnabled || tokens.length === 0) return;

    try {
      await getMessaging(this.firebaseApp!).unsubscribeFromTopic(tokens, topic);
    } catch (error) {
      this.logger.error(`Topic unsubscribe failed for "${topic}"`, error);
    }
  }

  // ─── Private Helpers ──────────────────────────────────────

  private async getDeviceTokens(userId: string): Promise<string[]> {
    const records = await this.deviceTokenRepo.find({
      where: { user: { id: userId } },
      select: ['deviceToken'],
    });
    return records.map((r) => r.deviceToken);
  }

  private async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Build a hybrid FCM multicast message with both `notification`
   * (OS-rendered banner) and `data` (app-handled deep-link + badge).
   */
  private buildMulticastMessage(
    tokens: string[],
    payload: PushPayload,
    unreadCount?: number,
  ): MulticastMessage {
    return {
      tokens,
      // ── OS-rendered banner (works when app is killed/background) ──
      notification: {
        title: payload.title,
        body: payload.body,
      },
      // ── App-handled data (deep-linking, badge, metadata) ──
      data: {
        type: payload.type,
        ...(unreadCount !== undefined
          ? { unreadCount: String(unreadCount) }
          : {}),
        ...(payload.data ?? {}),
      },
      // ── Platform-specific overrides ──
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'lms_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            ...(unreadCount !== undefined ? { badge: unreadCount } : {}),
          },
        },
      },
    };
  }

  /**
   * Send multicast in batches of 500 (FCM limit per call).
   * Automatically cleans up stale/unregistered tokens.
   */
  private async sendMulticastBatched(
    message: Omit<MulticastMessage, 'tokens'>,
    allTokens: string[],
  ): Promise<void> {
    const BATCH_SIZE = 500;
    const staleTokens: string[] = [];

    for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
      const batchTokens = allTokens.slice(i, i + BATCH_SIZE);

      try {
        const response = await getMessaging(this.firebaseApp!).sendEachForMulticast({
          ...message,
          tokens: batchTokens,
        });

        // Collect stale tokens from failures
        response.responses.forEach((resp: any, idx: number) => {
          if (
            resp.error &&
            (resp.error.code === 'messaging/registration-token-not-registered' ||
             resp.error.code === 'messaging/invalid-registration-token')
          ) {
            const token = batchTokens[idx];
            if (token) staleTokens.push(token);
          }
        });

        if (response.failureCount > 0) {
          this.logger.warn(
            `Push batch ${i / BATCH_SIZE + 1}: ${response.successCount} ok, ${response.failureCount} failed`,
          );
        }
      } catch (error) {
        this.logger.error(`Push batch ${i / BATCH_SIZE + 1} failed entirely`, error);
      }
    }

    // Clean up stale tokens in background
    if (staleTokens.length > 0) {
      this.cleanupStaleTokens(staleTokens).catch((err) =>
        this.logger.error('Stale token cleanup failed', err),
      );
    }
  }

  /**
   * Delete device tokens that FCM reports as unregistered.
   * Prevents repeated failures on subsequent sends.
   */
  private async cleanupStaleTokens(tokens: string[]): Promise<void> {
    const result = await this.deviceTokenRepo.delete({
      deviceToken: In(tokens),
    });
    this.logger.log(`Cleaned up ${result.affected} stale device tokens`);
  }
}
