export type StorageProviderType = 'cloudinary' | 's3' | 'gcs';

export interface DirectUploadSessionResult {
  provider: StorageProviderType;
  uploadUrl: string;
  httpMethod: 'POST' | 'PUT';
  fields?: Record<string, any>;
  headers?: Record<string, string>;
  chunkSize: number;
  publicId?: string;
}

export interface VerifiedAssetResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export abstract class StorageService {
  /**
   * Server-side upload, restricted to small low-frequency assets (e.g. avatars).
   * Course media MUST use the direct-to-cloud flow instead.
   */
  abstract upload(
    file: Express.Multer.File,
    directory: string,
  ): Promise<VerifiedAssetResult>;

  /**
   * Generates direct upload session parameters and short-lived signatures/URLs.
   */
  abstract createDirectUploadSession(
    sessionId: string,
    directory: string,
    filename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<DirectUploadSessionResult>;

  /**
   * Validates that an asset was successfully uploaded to the cloud provider.
   */
  abstract verifyUploadedAsset(
    identifier: string,
    metadata?: Record<string, any>,
  ): Promise<VerifiedAssetResult | null>;

  /**
   * Deletes an asset from cloud storage.
   */
  abstract delete(identifier: string): Promise<void>;

  /**
   * Resolves the public CDN delivery URL for an asset.
   */
  abstract getUrl(identifier: string): string;
}
