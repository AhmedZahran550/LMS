import { z } from 'zod';

/**
 * Base schema — variables that are ALWAYS required regardless of storage provider.
 */
const baseSchema = z.object({
  API_URL: z.string().url({ message: 'API_URL must be a valid URL (e.g. http://localhost:5000)' }),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
});

/**
 * Additional variables required when STORAGE_PROVIDER=cloudinary.
 */
const cloudinarySchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
});

/**
 * Validates that all required environment variables are present at startup.
 * Throws an error listing ALL missing / invalid variables so developers can fix them in one go.
 *
 * Used by ConfigModule.forRoot({ validate: validateEnv })
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  // 1. Always-required variables
  const baseResult = baseSchema.safeParse(config);

  // 2. Conditionally-required Cloudinary variables
  const storageProvider = (config['STORAGE_PROVIDER'] as string) || 'local';
  const cloudinaryResult =
    storageProvider === 'cloudinary'
      ? cloudinarySchema.safeParse(config)
      : null;

  // 3. Collect all errors
  const errors: string[] = [];

  if (!baseResult.success) {
    for (const issue of baseResult.error.issues) {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (cloudinaryResult && !cloudinaryResult.success) {
    for (const issue of cloudinaryResult.error.issues) {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    }
  }

  // 4. Report
  if (errors.length > 0) {
    throw new Error(
      `\n❌ Environment validation failed:\n` +
        errors.map((e) => `   • ${e}`).join('\n') +
        `\n\nAdd/fix them in your .env file and restart the server.\n`,
    );
  }

  return config;
}
