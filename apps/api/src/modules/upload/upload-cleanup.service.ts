import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { UploadService } from './upload.service';

@Injectable()
export class UploadCleanupService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(UploadCleanupService.name);
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly uploadService: UploadService) {}

  onApplicationBootstrap() {
    // Run cleanup on application startup
    this.uploadService.cleanupExpiredSessions().catch((err) => {
      this.logger.error('Failed to cleanup expired upload sessions on startup', err);
    });

    // Schedule cleanup to run every 6 hours (21600000 ms)
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.uploadService.cleanupExpiredSessions();
      } catch (err) {
        this.logger.error('Failed to cleanup expired upload sessions', err);
      }
    }, 6 * 60 * 60 * 1000);
  }

  onApplicationShutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
