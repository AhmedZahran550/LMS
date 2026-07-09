import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
}));
