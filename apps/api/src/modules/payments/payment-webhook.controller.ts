import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import { KashierService } from './kashier.service';
import { CoursePurchasesService } from '../course-purchases/course-purchases.service';
import { StorageSubscriptionsService } from '../storage/services/storage-subscriptions.service';
import { PaymentsSwagger } from '../../swagger';

@ApiTags('Payments')
@Controller('webhooks/kashier')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private readonly kashierService: KashierService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @PaymentsSwagger.handleWebhook()
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-kashier-signature') signatureHeader?: string,
  ) {
    this.logger.log(`Received Kashier webhook notification: ${JSON.stringify(payload)}`);

    const isValid = this.kashierService.verifyWebhookSignature(
      payload,
      signatureHeader,
    );

    if (!isValid && process.env.NODE_ENV === 'production') {
      this.logger.error('Invalid Kashier webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const orderId = payload.merchantOrderId || payload.orderId;
    const paymentStatus = (payload.paymentStatus || payload.status || '').toUpperCase();
    const paymentId = payload.kashierPaymentId || payload.transactionId || payload.paymentId;

    this.logger.log(
      `Kashier order ${orderId} status: ${paymentStatus}, transactionId: ${paymentId}`,
    );

    if (paymentStatus === 'SUCCESS' || paymentStatus === 'CAPTURED' || paymentStatus === 'COMPLETED') {
      try {
        if (typeof orderId === 'string' && orderId.startsWith('course_')) {
          const coursePurchasesService = this.moduleRef.get(CoursePurchasesService, { strict: false });
          if (coursePurchasesService) {
            await coursePurchasesService.completePurchase(orderId, paymentId);
          }
        } else if (typeof orderId === 'string' && orderId.startsWith('storage_')) {
          const storageSubscriptionsService = this.moduleRef.get(StorageSubscriptionsService, { strict: false });
          if (storageSubscriptionsService) {
            await storageSubscriptionsService.activateSubscription(orderId, paymentId);
          }
        }
      } catch (err: any) {
        this.logger.error(`Error processing webhook for order ${orderId}: ${err.message}`, err.stack);
      }
    }

    return {
      received: true,
      orderId,
      status: paymentStatus,
    };
  }
}
