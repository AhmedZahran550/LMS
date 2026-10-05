import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UploadSession } from '../../db/entities/upload-session.entity';
import { StorageService } from '../storage/storage.service';
import { StorageQuotaGuardService } from '../storage/services/storage-quota-guard.service';
import { CoursesService } from '../courses/courses.service';
import { InitUploadSessionDto } from './dto/init-upload-session.dto';
import {
  UploadSessionResponseDto,
  UploadStatusResponseDto,
} from './dto/upload-session-response.dto';
import { UploadSessionStatus } from '@lms/shared-types';

/**
 * Grace period after a session expires before its orphaned cloud asset is purged.
 * Protects against races with a client that just finished transmitting the file.
 */
const CLOUD_ASSET_PURGE_GRACE_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(UploadSession)
    private readonly sessionRepository: Repository<UploadSession>,
    private readonly storageService: StorageService,
    private readonly storageQuotaGuard: StorageQuotaGuardService,
    private readonly coursesService: CoursesService,
  ) {}

  async initiateCourseContentSession(
    instructorId: string,
    courseId: string,
    dto: InitUploadSessionDto,
  ): Promise<UploadSessionResponseDto> {
    // 1. Verify instructor owns course
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    // 2. Validate quota
    await this.storageQuotaGuard.checkUploadAllowed(instructorId, dto.fileSize);

    // 3. Pre-create session record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    const folder = `courses/${courseId}`;

    const session = this.sessionRepository.create({
      instructorId,
      courseId,
      fileName: dto.fileName,
      fileSize: String(dto.fileSize),
      mimeType: dto.mimeType,
      folder,
      status: UploadSessionStatus.PENDING,
      uploadedBytes: '0',
      expiresAt,
    });

    const savedSession = await this.sessionRepository.save(session);

    // 4. Generate direct upload parameters from storage provider
    const uploadSessionInfo = await this.storageService.createDirectUploadSession(
      savedSession.id,
      folder,
      dto.fileName,
      dto.mimeType,
      dto.fileSize,
    );

    // 5. Update session with provider details
    savedSession.provider = uploadSessionInfo.provider;
    savedSession.publicId = uploadSessionInfo.publicId;
    savedSession.uploadParams = {
      fields: uploadSessionInfo.fields,
      headers: uploadSessionInfo.headers,
    };

    await this.sessionRepository.save(savedSession);

    return {
      sessionId: savedSession.id,
      provider: uploadSessionInfo.provider,
      uploadUrl: uploadSessionInfo.uploadUrl,
      httpMethod: uploadSessionInfo.httpMethod,
      chunkSize: uploadSessionInfo.chunkSize,
      totalBytes: dto.fileSize,
      fields: uploadSessionInfo.fields,
      headers: uploadSessionInfo.headers,
      publicId: uploadSessionInfo.publicId,
    };
  }

  async getUploadStatus(
    sessionId: string,
    userId: string,
  ): Promise<UploadStatusResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.instructorId !== userId) {
      throw new ForbiddenException('You do not have access to this upload session');
    }

    const totalBytes = Number(session.fileSize);
    let uploadedBytes = Number(session.uploadedBytes || 0);

    // Direct-to-cloud providers only materialise an asset once transmission
    // completes, so polling the provider tells the client whether the file landed.
    if (session.status === UploadSessionStatus.PENDING && session.publicId) {
      const verified = await this.storageService.verifyUploadedAsset(
        session.publicId,
        { resourceType: session.mimeType },
      );
      if (verified) {
        uploadedBytes = verified.size;
        if (session.uploadedBytes !== String(uploadedBytes)) {
          session.uploadedBytes = String(uploadedBytes);
          await this.sessionRepository.save(session);
        }
      }
    }

    const percentage =
      totalBytes > 0 ? parseFloat(((uploadedBytes / totalBytes) * 100).toFixed(2)) : 0;

    return {
      sessionId: session.id,
      status: session.status,
      totalBytes,
      uploadedBytes,
      nextByteOffset: uploadedBytes,
      percentage,
    };
  }

  async abortSession(
    sessionId: string,
    userId: string,
  ): Promise<{ sessionId: string; status: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.instructorId !== userId) {
      throw new ForbiddenException('You do not have access to this upload session');
    }

    if (session.status === UploadSessionStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot abort an upload session that has already been completed',
      );
    }

    // An explicit cancel means the teacher is done: drop the asset immediately
    // so the reserved quota is genuinely released.
    await this.purgeOrphanedAsset(session, true);

    session.status = UploadSessionStatus.ABORTED;
    await this.sessionRepository.save(session);

    return {
      sessionId: session.id,
      status: 'aborted',
    };
  }

  async findSessionById(sessionId: string): Promise<UploadSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    return session;
  }

  async saveSession(session: UploadSession): Promise<UploadSession> {
    return this.sessionRepository.save(session);
  }

  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.sessionRepository.find({
      where: {
        status: UploadSessionStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const session of expiredSessions) {
      await this.purgeOrphanedAsset(session);
      session.status = UploadSessionStatus.EXPIRED;
      await this.sessionRepository.save(session);
    }

    if (expiredSessions.length > 0) {
      this.logger.log(`Cleaned up ${expiredSessions.length} expired upload sessions`);
    }

    return expiredSessions.length;
  }

  /**
   * Best-effort removal of a cloud asset that was transmitted but never committed
   * to a CourseContent record. Never throws: cleanup failures must not block the
   * session state transition.
   *
   * `immediate` skips the grace period and is used when the teacher explicitly
   * cancels. Completed sessions are always protected so live course media can
   * never be destroyed by session cleanup.
   */
  private async purgeOrphanedAsset(
    session: UploadSession,
    immediate = false,
  ): Promise<void> {
    if (!session.publicId) return;
    if (session.status === UploadSessionStatus.COMPLETED) return;

    if (!immediate) {
      const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
      if (Date.now() - expiresAt < CLOUD_ASSET_PURGE_GRACE_MS) return;
    }

    try {
      await this.storageService.delete(session.publicId);
      this.logger.log(`Purged orphaned cloud asset ${session.publicId}`);
    } catch (err: any) {
      this.logger.warn(
        `Could not purge orphaned cloud asset ${session.publicId}: ${err?.message}`,
      );
    }
  }
}
