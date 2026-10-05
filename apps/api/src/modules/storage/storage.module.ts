import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { User } from '../../db/entities/user.entity';
import { CourseContent } from '../../db/entities/course-content.entity';
import { StorageSubscription } from '../../db/entities/storage-subscription.entity';
import { StorageAddon } from '../../db/entities/storage-addon.entity';
import { StoragePlan } from '../../db/entities/storage-plan.entity';
import { StorageQuotaGuardService } from './services/storage-quota-guard.service';
import { StorageSubscriptionsService } from './services/storage-subscriptions.service';
import { InstructorStorageController } from './controllers/instructor-storage.controller';
import { AdminStoragePlansController } from './controllers/admin-storage-plans.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CourseContent,
      StorageSubscription,
      StorageAddon,
      StoragePlan,
    ]),
    PaymentsModule,
  ],
  controllers: [InstructorStorageController, AdminStoragePlansController],
  providers: [
    StorageQuotaGuardService,
    StorageSubscriptionsService,
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
  exports: [StorageService, StorageQuotaGuardService, StorageSubscriptionsService],
})
export class StorageModule {}
