import { Page } from '../../models/Page';
import { NotFound } from '../../utils/errors';

const WORKSPACE = 'default';

export async function getPublishedPage(slug: string) {
  const page = await Page.findOne({ workspaceId: WORKSPACE, slug }).lean();
  if (!page) throw NotFound(`Page not found: ${slug}`, 'PAGE_NOT_FOUND');
  if (!page.publishedLayout) throw NotFound('Page has not been published yet.', 'NOT_PUBLISHED');

  return {
    slug: page.slug,
    title: page.title,
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    seoKeywords: page.seoKeywords ?? null,
    ogImage: page.ogImage ?? null,
    noindex: page.noindex ?? false,
    version: page.version,
    publishedAt: page.lastPublishedAt,
    layout: page.publishedLayout
      .filter((s) => s.visible)
      .map((s) => ({
        instanceId: s.instanceId,
        sectionKey: s.sectionKey,
        type: s.type,
        data: s.data,
      })),
  };
}
