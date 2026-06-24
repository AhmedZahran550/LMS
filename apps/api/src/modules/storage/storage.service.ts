export abstract class StorageService {
  abstract upload(file: Express.Multer.File, directory: string): Promise<{ url: string, filename: string, size: number, mimeType: string }>;
  abstract delete(filename: string): Promise<void>;
  abstract getUrl(filename: string): string;
}
