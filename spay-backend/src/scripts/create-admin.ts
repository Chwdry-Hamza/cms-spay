/**
 * Generate a bcrypt hash for the admin password.
 *
 *   npm run create-admin -- mySecretPassword
 *
 * Prints the hash. Copy it into .env as ADMIN_PASSWORD_HASH=...
 */
import bcrypt from 'bcryptjs';

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run create-admin -- <password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  console.log('\nPaste this into your .env as ADMIN_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
