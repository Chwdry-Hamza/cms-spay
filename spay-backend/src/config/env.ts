import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  IS_PROD: process.env.NODE_ENV === 'production',

  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/spay'),

  ADMIN_EMAIL: required('ADMIN_EMAIL', 'admin@spay.finance'),
  ADMIN_PASSWORD_HASH: required('ADMIN_PASSWORD_HASH'),

  JWT_SECRET: required('JWT_SECRET', 'dev-only-secret'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  CMS_ORIGIN: process.env.CMS_ORIGIN ?? 'http://localhost:3001',
  WEBSITE_ORIGIN: process.env.WEBSITE_ORIGIN ?? 'http://localhost:3000',
  PUBLIC_URL: process.env.PUBLIC_URL ?? 'http://localhost:4000',

  WEBSITE_REVALIDATE_URL: process.env.WEBSITE_REVALIDATE_URL ?? '',
  WEBSITE_REVALIDATE_SECRET: process.env.WEBSITE_REVALIDATE_SECRET ?? '',

  // Shared secret for the website's runtime page auto-registration endpoint.
  // When set, the website must send a matching `x-register-secret` header.
  // When unset, registration is allowed only outside production (dev convenience).
  REGISTER_SECRET: process.env.SPAY_REGISTER_SECRET ?? '',
} as const;

export type Env = typeof env;
