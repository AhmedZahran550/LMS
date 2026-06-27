import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER || 'smtp',
  from: process.env.MAIL_FROM || 'noreply@lms.com',
  smtp: {
    host: process.env.SMTP_HOST || 'placeholder',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || 'placeholder',
    pass: process.env.SMTP_PASS || 'placeholder',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },
}));
