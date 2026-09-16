import { registerAs } from '@nestjs/config';

export default registerAs('kashier', () => ({
  merchantId: process.env.KASHIER_MERCHANT_ID || 'MID-placeholder',
  apiKey: process.env.KASHIER_API_KEY || 'kashier-api-key-placeholder',
  secretKey: process.env.KASHIER_SECRET_KEY || 'kashier-secret-key-placeholder',
  webhookSecret: process.env.KASHIER_WEBHOOK_SECRET || 'kashier-webhook-secret-placeholder',
  baseUrl: process.env.KASHIER_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.kashier.io' : 'https://test-api.kashier.io'),
  callbackUrl: process.env.KASHIER_CALLBACK_URL || 'http://localhost:3000/payments/callback',
}));
