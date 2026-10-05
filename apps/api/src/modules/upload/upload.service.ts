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
import { LocalStorageService } from '../storage/local-storage.service';
import { StorageQuotaGuardService } from '../storage/services/storage-quota-guard.service';
import { CoursesService } from '../courses/courses.service';
import { InitUploadSessionDto } from './dto/init-upload-session.dto';
import {
  UploadSessionResponseDto,
  UploadStatusResponseDto,
} from './dto/upload-session-response.dto';
import { UploadSessionStatus } from '@lms/shared-types';

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

    let uploadedBytes = Number(session.uploadedBytes || 0);
    const totalBytes = Number(session.fileSize);

    // If local provider, check actual bytes written to disk
    if (session.provider === 'local' && this.storageService instanceof LocalStorageService) {
      const localStatus = await this.storageService.getChunkStatus(sessionId, totalBytes);
      uploadedBytes = localStatus.uploadedBytes;
      if (session.uploadedBytes !== String(uploadedBytes)) {
        session.uploadedBytes = String(uploadedBytes);
        await this.sessionRepository.save(session);
      }
    }

    const percentage = totalBytes > 0 ? parseFloat(((uploadedBytes / totalBytes) * 100).toFixed(2)) : 0;

    return {
      sessionId: session.id,
      status: session.status,
      totalBytes,
      uploadedBytes,
      nextByteOffset: uploadedBytes,
      percentage,
    };
  }

  async appendLocalChunk(
    sessionId: string,
    userId: string,
    contentRangeHeader: string | undefined,
    chunkBuffer: Buffer,
  ): Promise<{ bytesReceived: number; totalBytes: number; isComplete: boolean }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.instructorId !== userId) {
      throw new ForbiddenException('You do not have access to this upload session');
    }

    if (session.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException(`Cannot upload chunk. Session status is ${session.status}`);
    }

    if (session.provider !== 'local' || !(this.storageService instanceof LocalStorageService)) {
      throw new BadRequestException('Local chunk uploads are only valid when storage provider is local');
    }

    let startOffset = 0;
    const totalBytes = Number(session.fileSize);

    if (contentRangeHeader) {
      // Content-Range: bytes <start>-<end>/<total>
      const match = contentRangeHeader.match(/bytes\s+(\d+)-(\d+)\/(\d+)/i);
      if (match && match[1]) {
        startOffset = parseInt(match[1], 10);
      }
    } else {
      startOffset = Number(session.uploadedBytes || 0);
    }

    const result = await this.storageService.appendChunk(
      sessionId,
      chunkBuffer,
      startOffset,
      totalBytes,
    );

    session.uploadedBytes = String(result.bytesReceived);
    await this.sessionRepository.save(session);

    return result;
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

    if (session.provider === 'local' && this.storageService instanceof LocalStorageService) {
      await this.storageService.cleanupTempSession(sessionId);
    }

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
      if (session.provider === 'local' && this.storageService instanceof LocalStorageService) {
        await this.storageService.cleanupTempSession(session.id);
      }
      session.status = UploadSessionStatus.EXPIRED;
      await this.sessionRepository.save(session);
    }

    if (expiredSessions.length > 0) {
      this.logger.log(`Cleaned up ${expiredSessions.length} expired upload sessions`);
    }

    return expiredSessions.length;
  }
}
