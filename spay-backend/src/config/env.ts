import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const IS_PROD = process.env.NODE_ENV === 'production';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

/**
 * Critical config that MUST be set explicitly in production. In development a
 * convenience fallback is allowed (zero-config local setup), but in production
 * the process refuses to boot if it's missing — this prevents shipping with
 * insecure defaults like a publicly-known JWT secret or localhost CORS origins.
 */
function prodRequired(key: string, devFallback: string): string {
  const value = process.env[key];
  if (value) return value;
  if (IS_PROD) throw new Error(`Missing required env var in production: ${key}`);
  return devFallback;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  IS_PROD,

  MONGODB_URI: prodRequired('MONGODB_URI', 'mongodb://localhost:27017/spay'),

  ADMIN_EMAIL: prodRequired('ADMIN_EMAIL', 'admin@spay.finance'),
  ADMIN_PASSWORD_HASH: required('ADMIN_PASSWORD_HASH'),

  JWT_SECRET: prodRequired('JWT_SECRET', 'dev-only-secret'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  CMS_ORIGIN: prodRequired('CMS_ORIGIN', 'http://localhost:3001'),
  WEBSITE_ORIGIN: prodRequired('WEBSITE_ORIGIN', 'http://localhost:3000'),
  PUBLIC_URL: process.env.PUBLIC_URL ?? 'http://localhost:4000',

  WEBSITE_REVALIDATE_URL: process.env.WEBSITE_REVALIDATE_URL ?? '',
  WEBSITE_REVALIDATE_SECRET: process.env.WEBSITE_REVALIDATE_SECRET ?? '',

  // Shared secret for the website's runtime page auto-registration endpoint.
  // When set, the website must send a matching `x-register-secret` header.
  // When unset, registration is allowed only outside production (dev convenience).
  REGISTER_SECRET: process.env.SPAY_REGISTER_SECRET ?? '',

  // Cloudinary — all media (images/video/docs) is stored here.
  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),
} as const;

export type Env = typeof env;
