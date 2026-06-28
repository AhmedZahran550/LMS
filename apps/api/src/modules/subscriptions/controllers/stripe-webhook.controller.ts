import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../services/stripe.service';

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      return { received: true };
    }

    const payload = (req as any).rawBody;

    let event;
    try {
      event = await this.stripeService.constructWebhookEvent(
        payload,
        signature,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      return { received: true };
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.stripeService.handleCheckoutCompleted(
          event.data.object as any,
        );
        break;

      case 'invoice.paid':
        await this.stripeService.handleInvoicePaid(
          event.data.object as any,
        );
        break;

      case 'invoice.payment_failed':
        await this.stripeService.handleInvoicePaymentFailed(
          event.data.object as any,
        );
        break;

      case 'customer.subscription.deleted':
        await this.stripeService.handleSubscriptionDeleted(
          (event.data.object as any).id,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
