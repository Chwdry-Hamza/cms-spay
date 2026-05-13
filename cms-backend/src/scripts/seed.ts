import { connectDb, disconnectDb } from '../config/db';
import { logger } from '../config/logger';
import { Page } from '../models/Page';
import { createPage } from '../modules/builder/builder.service';

async function main() {
  await connectDb();

  const slug = '/';
  const existing = await Page.findOne({ workspaceId: 'default', slug });
  if (existing) {
    logger.info({ slug, id: existing._id.toString() }, 'Page already exists; nothing to seed.');
  } else {
    const page = await createPage({
      slug,
      title: 'Home / Landing Page',
      workspaceId: 'default',
    });
    logger.info(
      { slug: page.slug, id: page._id.toString(), sections: page.draftLayout.length },
      'Seeded landing page from section catalogue.',
    );
  }

  await disconnectDb();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
