import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageService, DirectUploadSessionResult } from "./storage.service";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadDir: string;
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(private configService: ConfigService) {
    super();
    this.uploadDir =
      this.configService.get<string>("storage.uploadDir") || "./uploads";
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    directory: string,
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }> {
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${directory}/${crypto.randomUUID()}${ext}`;
    const fullPath = path.join(this.uploadDir, uniqueFilename);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, file.buffer);

    this.logger.log(`File saved locally: ${fullPath}`);

    return {
      url: this.getUrl(uniqueFilename),
      filename: uniqueFilename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async createDirectUploadSession(
    sessionId: string,
    directory: string,
    filename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<DirectUploadSessionResult> {
    const apiUrl = this.configService.get<string>("app.apiUrl") || "";
    const uniquePublicId = `${directory}/${crypto.randomUUID()}${path.extname(filename)}`;

    return {
      provider: "local",
      uploadUrl: `${apiUrl}/api/uploads/local/${sessionId}/chunk`,
      httpMethod: "PATCH",
      fields: {},
      headers: {
        "X-Unique-Upload-Id": sessionId,
      },
      chunkSize: 10 * 1024 * 1024,
      publicId: uniquePublicId,
    };
  }

  getTempFilePath(sessionId: string): string {
    return path.join(this.uploadDir, "temp", sessionId, "data.tmp");
  }

  async appendChunk(
    sessionId: string,
    chunkBuffer: Buffer,
    startOffset: number,
    totalBytes: number,
  ): Promise<{ bytesReceived: number; totalBytes: number; isComplete: boolean }> {
    const tempFile = this.getTempFilePath(sessionId);
    const tempDir = path.dirname(tempFile);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const handle = await fs.promises.open(tempFile, fs.constants.O_CREAT | fs.constants.O_RDWR);
    try {
      await handle.write(chunkBuffer, 0, chunkBuffer.length, startOffset);
    } finally {
      await handle.close();
    }

    const stat = await fs.promises.stat(tempFile);
    const bytesReceived = stat.size;
    const isComplete = bytesReceived >= totalBytes;

    return { bytesReceived, totalBytes, isComplete };
  }

  async getChunkStatus(sessionId: string, totalBytes: number): Promise<{ uploadedBytes: number; nextByteOffset: number }> {
    const tempFile = this.getTempFilePath(sessionId);
    if (!fs.existsSync(tempFile)) {
      return { uploadedBytes: 0, nextByteOffset: 0 };
    }
    const stat = await fs.promises.stat(tempFile);
    return {
      uploadedBytes: stat.size,
      nextByteOffset: stat.size,
    };
  }

  async finalizeLocalFile(
    sessionId: string,
    directory: string,
    originalFilename: string,
  ): Promise<{ url: string; filename: string; size: number }> {
    const tempFile = this.getTempFilePath(sessionId);
    if (!fs.existsSync(tempFile)) {
      throw new Error(`Temp upload file for session ${sessionId} not found.`);
    }

    const ext = path.extname(originalFilename);
    const uniqueFilename = `${directory}/${crypto.randomUUID()}${ext}`;
    const destinationPath = path.join(this.uploadDir, uniqueFilename);

    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.rename(tempFile, destinationPath);

    try {
      await fs.promises.rm(path.dirname(tempFile), { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }

    const stat = await fs.promises.stat(destinationPath);

    return {
      url: this.getUrl(uniqueFilename),
      filename: uniqueFilename,
      size: stat.size,
    };
  }

  async cleanupTempSession(sessionId: string): Promise<void> {
    const tempDir = path.join(this.uploadDir, "temp", sessionId);
    if (fs.existsSync(tempDir)) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  }

  async delete(filename: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`File deleted: ${fullPath}`);
    }
  }

  getUrl(filename: string): string {
    const apiUrl = this.configService.get<string>("app.apiUrl");
    return `${apiUrl}/uploads/${filename}`;
  }
}
