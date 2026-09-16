import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KashierService } from './kashier.service';
import { PaymentWebhookController } from './payment-webhook.controller';
import kashierConfig from '../../config/kashier.config';

@Module({
  imports: [ConfigModule.forFeature(kashierConfig)],
  controllers: [PaymentWebhookController],
  providers: [KashierService],
  exports: [KashierService],
})
export class PaymentsModule {}
