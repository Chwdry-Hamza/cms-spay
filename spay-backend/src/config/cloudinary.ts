/**
 * Cloudinary client — all media is stored in Cloudinary (no local disk).
 * Credentials come from the backend .env (never hard-coded / committed).
 */
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
