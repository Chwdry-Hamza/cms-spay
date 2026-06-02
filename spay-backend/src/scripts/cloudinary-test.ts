/**
 * One-off Cloudinary connectivity check. Run: npx tsx src/scripts/cloudinary-test.ts
 * Uploads a demo image, prints its details, and an f_auto/q_auto optimized URL.
 */
import { cloudinary } from '../config/cloudinary';

async function main() {
  // 1. Upload a sample image from Cloudinary's demo domain.
  const result = await cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    { folder: 'spay/_test' },
  );
  console.log('Uploaded secure URL :', result.secure_url);
  console.log('Public ID           :', result.public_id);

  // 2. Image details.
  console.log(
    `Details             : width=${result.width} height=${result.height} format=${result.format} bytes=${result.bytes}`,
  );

  // 3. Optimized URL — f_auto picks the best format (e.g. WebP/AVIF) for the
  //    requesting browser; q_auto auto-selects the best quality/size tradeoff.
  const optimized = cloudinary.url(result.public_id, {
    fetch_format: 'auto', // f_auto
    quality: 'auto', // q_auto
    secure: true,
  });

  console.log('\nDone! Click link below to see optimized version of the image. Check the size and the format.');
  console.log(optimized);
}

main().catch((e) => {
  console.error('Cloudinary test failed:', e?.message || e);
  process.exit(1);
});
