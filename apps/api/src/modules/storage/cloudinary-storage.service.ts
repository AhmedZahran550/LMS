import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StorageService,
  DirectUploadSessionResult,
  VerifiedAssetResult,
} from './storage.service';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';
import * as stream from 'stream';

@Injectable()
export class CloudinaryStorageService extends StorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);

  constructor(private configService: ConfigService) {
    super();
    const cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
    const apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('storage.cloudinary.apiSecret');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }

  async upload(
    file: Express.Multer.File,
    directory: string,
  ): Promise<VerifiedAssetResult> {
    const ext = file.originalname.split('.').pop();
    const publicId = directory + '/' + crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed: ' + error?.message);
            reject(error || new Error('Upload failed'));
            return;
          }

          this.logger.log('File uploaded to Cloudinary: ' + result.public_id);

          resolve({
            url: result.secure_url,
            filename: result.public_id,
            size: result.bytes,
            mimeType: result.resource_type === 'image' ? 'image/' + ext : file.mimetype,
          });
        },
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async createDirectUploadSession(
    sessionId: string,
    directory: string,
    filename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<DirectUploadSessionResult> {
    const cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
    const apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('storage.cloudinary.apiSecret');

    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `${directory}/${crypto.randomUUID()}`;

    let resourceType = 'auto';
    if (mimeType.startsWith('video/')) {
      resourceType = 'video';
    } else if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType === 'application/pdf' || mimeType.includes('presentation') || mimeType.includes('document')) {
      resourceType = 'raw';
    }

    const paramsToSign: Record<string, any> = {
      folder: directory,
      public_id: publicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!);

    return {
      provider: 'cloudinary',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      httpMethod: 'POST',
      fields: {
        api_key: apiKey,
        timestamp,
        signature,
        folder: directory,
        public_id: publicId,
        resource_type: resourceType,
      },
      headers: {
        'X-Unique-Upload-Id': sessionId,
      },
      chunkSize: 10 * 1024 * 1024,
      publicId,
    };
  }

  async verifyUploadedAsset(
    publicId: string,
    metadata?: Record<string, any>,
  ): Promise<VerifiedAssetResult | null> {
    const resourceType = (metadata?.resourceType as string) || 'auto';
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return {
        url: result.secure_url,
        filename: result.public_id,
        size: result.bytes,
        mimeType:
          result.resource_type === 'image'
            ? `image/${result.format}`
            : result.resource_type === 'video'
              ? `video/${result.format}`
              : 'application/octet-stream',
      };
    } catch (err: any) {
      this.logger.warn(
        `Could not verify Cloudinary resource ${publicId}: ${err?.message}`,
      );
      return null;
    }
  }

  async delete(identifier: string): Promise<void> {
    // Resolve the concrete resource type so raw/video assets are removed too.
    let resourceType = 'image';
    try {
      const meta = await cloudinary.api.resource(identifier, {
        resource_type: 'auto',
      });
      if (meta?.resource_type) {
        resourceType = meta.resource_type;
      }
    } catch {
      resourceType = 'raw';
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        identifier,
        { resource_type: resourceType, invalidate: true },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary delete failed: ' + error.message);
            reject(error);
            return;
          }
          this.logger.log(
            `Asset deleted from Cloudinary: ${identifier} (${result?.resource_type ?? resourceType})`,
          );
          resolve();
        },
      );
    });
  }

  getUrl(filename: string): string {
    const cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }
    return 'https://res.cloudinary.com/' + cloudName + '/raw/upload/' + filename;
  }
}
