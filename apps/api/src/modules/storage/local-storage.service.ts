import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadDir: string;
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(private configService: ConfigService) {
    super();
    this.uploadDir = this.configService.get<string>('storage.uploadDir') || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, directory: string): Promise<{ url: string, filename: string, size: number, mimeType: string }> {
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

  async delete(filename: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`File deleted: ${fullPath}`);
    }
  }

  getUrl(filename: string): string {
    const apiUrl = this.configService.get<string>('app.apiUrl');
    return `${apiUrl}/uploads/${filename}`;
  }
}
