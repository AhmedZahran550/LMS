export interface DirectUploadSessionResult {
  provider: 'cloudinary' | 'local';
  uploadUrl: string;
  httpMethod: string;
  fields?: Record<string, any>;
  headers?: Record<string, string>;
  chunkSize: number;
  publicId?: string;
}

export abstract class StorageService {
  abstract upload(file: Express.Multer.File, directory: string): Promise<{ url: string, filename: string, size: number, mimeType: string }>;
  abstract delete(filename: string): Promise<void>;
  abstract getUrl(filename: string): string;

  abstract createDirectUploadSession(
    sessionId: string,
    directory: string,
    filename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<DirectUploadSessionResult>;
}
