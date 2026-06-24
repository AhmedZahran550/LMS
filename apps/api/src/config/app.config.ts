import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  webUrl: process.env.WEB_URL || 'http://localhost:3001',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3002',
}));
