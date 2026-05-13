import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1),
  CMS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  PUBLIC_SITE_ORIGIN: z.string().min(1).default('http://localhost:3001'),
  AUTOSAVE_MIN_INTERVAL_MS: z.coerce.number().int().nonnegative().default(1500),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SPAY_WEBSITE_PATH: z.string().default('../spay-website'),
  SECTION_MANIFEST_CACHE_MS: z.coerce.number().int().nonnegative().default(30_000),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
