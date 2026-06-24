import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10), // Default 500MB
}));
