import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
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

  async upload(file: Express.Multer.File, directory: string): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
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

  async delete(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(filename, (error, result) => {
        if (error) {
          this.logger.error('Cloudinary delete failed: ' + error.message);
          reject(error);
          return;
        }
        this.logger.log('File deleted from Cloudinary: ' + filename);
        resolve();
      });
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
