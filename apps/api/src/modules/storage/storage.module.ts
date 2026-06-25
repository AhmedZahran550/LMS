import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { CloudinaryStorageService } from './cloudinary-storage.service';

@Module({
  providers: [
    {
      provide: StorageService,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('storage.provider');
        if (provider === 'cloudinary') {
          return new CloudinaryStorageService(configService);
        }
        return new LocalStorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
