import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import kashierConfig from '../../config/kashier.config';

export interface CreatePaymentSessionOptions {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName?: string;
  description?: string;
}

export interface PaymentSessionResult {
  orderId: string;
  checkoutUrl: string;
}

@Injectable()
export class KashierService {
  private readonly logger = new Logger(KashierService.name);

  constructor(
    @Inject(kashierConfig.KEY)
    private readonly conf: ConfigType<typeof kashierConfig>,
  ) {}

  generateOrderHash(orderId: string, amount: number, currency = 'EGP'): string {
    const path = `/?payment=${this.conf.merchantId}.${orderId}.${amount}.${currency}`;
    return crypto
      .createHmac('sha256', this.conf.secretKey)
      .update(path)
      .digest('hex');
  }

  async createPaymentSession(
    options: CreatePaymentSessionOptions,
  ): Promise<PaymentSessionResult> {
    const { orderId, amount, currency = 'EGP', customerEmail } = options;
    const hash = this.generateOrderHash(orderId, amount, currency);

    try {
      // Try Kashier REST session creation endpoint first
      const endpoint = `${this.conf.baseUrl}/v3/payment/sessions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.conf.secretKey,
          'api-key': this.conf.apiKey,
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          customer: {
            email: customerEmail,
            name: options.customerName,
          },
          redirectUrl: this.conf.callbackUrl,
          failureRedirectUrl: this.conf.callbackUrl,
          display: 'ar',
          orderDescription: options.description || 'LMS Platform Purchase',
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data.sessionUrl || data.checkoutUrl) {
          return {
            orderId,
            checkoutUrl: data.sessionUrl || data.checkoutUrl,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Kashier API session call fallback to hosted URL: ${err.message}`,
      );
    }

    // Hosted checkout URL fallback
    const mode = this.conf.baseUrl.includes('test') ? 'test' : 'live';
    const checkoutUrl = `https://checkout.kashier.io/?merchantId=${encodeURIComponent(
      this.conf.merchantId,
    )}&orderId=${encodeURIComponent(orderId)}&amount=${amount}&currency=${encodeURIComponent(
      currency,
    )}&hash=${hash}&mode=${mode}&callbackUrl=${encodeURIComponent(
      this.conf.callbackUrl,
    )}`;

    return {
      orderId,
      checkoutUrl,
    };
  }

  verifyWebhookSignature(payload: Record<string, any>, signature?: string): boolean {
    if (!signature) {
      // If signature is provided within the payload object (e.g. signature or hash)
      signature = payload.signature || payload.hash;
    }
    if (!signature) return false;

    // Sort query/body parameters alphabetically to compute HMAC as per Kashier specification
    const sortedKeys = Object.keys(payload)
      .filter((k) => k !== 'signature' && k !== 'hash')
      .sort();

    const queryString = sortedKeys.map((k) => `${k}=${payload[k]}`).join('&');

    const expectedSignature = crypto
      .createHmac('sha256', this.conf.webhookSecret || this.conf.secretKey)
      .update(queryString)
      .digest('hex');

    return (
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      ) || signature === expectedSignature
    );
  }
}
