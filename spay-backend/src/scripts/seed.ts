/**
 * Seeds MongoDB with the same mock content the CMS UI currently displays.
 * Re-running is safe — it upserts by slug.
 *
 *   npm run seed
 */
import { connectDB } from '../db/connection';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { Redirect } from '../models/Redirect';
import { Setting } from '../models/Setting';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

function tipDoc(text: string) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

async function seed() {
  await connectDB();
  logger.info('[seed] starting…');

  // ─── Categories ──────────────────────────────────────────────
  const catData = [
    {
      slug: 'company', name: 'Company', color: '#46F1C5',
      description: "Founders' notes and team updates.",
      content: 'Behind-the-scenes from the Spay team — what we are building, why, and the principles we hold ourselves to.\n\nWe write here when we have something concrete to share: a launch, a milestone, a lesson learned. No filler.',
      seo: {
        title: 'Company news from Spay — founders\' notes & team updates',
        description: 'Read the latest company announcements, hiring news, and founders\' notes from the Spay team.',
      },
    },
    {
      slug: 'crypto', name: 'Crypto', color: '#5BE3A1',
      description: 'On-chain, stablecoins, and digital assets.',
      content: 'Practical writing on stablecoins, on-chain payments, and the bridges between fiat and crypto inside the Spay app.\n\nWe focus on what actually moves the needle for users and merchants — not price speculation.',
      seo: {
        title: 'Crypto & stablecoin news — Spay',
        description: 'Stablecoin launches, on-chain payments, and digital-asset coverage from the Spay team.',
      },
    },
    {
      slug: 'product', name: 'Product', color: '#E89B40',
      description: 'Launches, features, and roadmap.',
      content: 'Product launches, feature deep-dives, and what we are working on next.',
      seo: {
        title: 'Spay product launches & roadmap',
        description: 'New features, launches, and roadmap previews for the Spay money app.',
      },
    },
    {
      slug: 'design',  name: 'Design',  color: '#A88AFF',
      description: 'Brand, UI, and craft.',
      content: 'Notes on the craft — interface decisions, motion, typography, and how we keep Spay feeling unmistakably itself.',
      seo: {
        title: 'Design at Spay — brand, UI, and craft',
        description: 'How the Spay team thinks about brand, interface, and product design.',
      },
    },
    {
      slug: 'engineering', name: 'Engineering', color: '#2EE8A0',
      description: 'Infra, payments rails, and security.',
      content: 'Engineering writing on payments infrastructure, security, reliability, and the systems that move money behind the Spay app.',
      seo: {
        title: 'Spay engineering — payments infra & security',
        description: 'Engineering posts from the Spay team on payments infrastructure, security, and the systems behind the app.',
      },
    },
    {
      slug: 'compliance',  name: 'Compliance',  color: '#FF7A8A',
      description: 'Policy, KYC, and trust.',
      content: 'How we think about regulation, KYC, and the policies that protect customers without making the product feel hostile.',
      seo: {
        title: 'Compliance & policy at Spay',
        description: 'How Spay approaches regulation, KYC, and customer-trust policies.',
      },
    },
  ];
  const catMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of catData) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    catMap[c.name] = doc._id;
  }
  logger.info(`[seed] categories: ${Object.keys(catMap).length}`);

  // ─── Pages ───────────────────────────────────────────────────
  // Pages served by spay-website.
  // The root `/` (Home) is special: the body is ignored on the live landing,
  // but its SEO fields (title, description, OG image, etc.) are read by
  // generateMetadata() on the landing page.
  const pages = [
    { slug: '/',                       title: 'Home',                  template: 'Landing', status: 'published', excerpt: 'Spay — money, made simple.', authorName: 'Aria S.'  },
    { slug: '/about',                  title: 'About Spay',             template: 'Content', status: 'published', excerpt: 'Our story',                authorName: 'Theo N.'  },
    { slug: '/card-terms',             title: 'Card Terms',            template: 'Legal',   status: 'published', excerpt: 'Terms for the Spay card',   authorName: 'Priya S.' },
    { slug: '/privacy-policy',         title: 'Privacy Policy',        template: 'Legal',   status: 'published', excerpt: 'How we handle your data',  authorName: 'Priya S.' },
    { slug: '/prohibited-activities',  title: 'Prohibited Activities', template: 'Legal',   status: 'published', excerpt: 'Where we draw the line',   authorName: 'Priya S.' },
  ];
  for (const p of pages) {
    await Page.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          ...p,
          content: tipDoc(`This is the ${p.title} page. Edit it from the CMS to update the live site.`),
          publishedAt: p.status === 'published' ? new Date('2026-04-20') : undefined,
          seo: {
            title: `${p.title} | Spay`,
            description: p.excerpt,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`[seed] pages: ${pages.length}`);

  // ─── Posts ───────────────────────────────────────────────────
  const posts = [
    { slug: 'why-we-built-spay',           title: 'Why we built Spay',                    excerpt: 'A founder note on the gap between how money moves and how people live.', category: 'Company',     tags: ['founders','story'],         status: 'published', authorName: 'Aria S.',   readTime: 6, cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop' },
    { slug: 'stablecoins-at-checkout',    title: 'Stablecoins at checkout, finally',    excerpt: 'How USDC moves the merchant economics in your favor.',                  category: 'Crypto',      tags: ['stablecoins','merchants'],  status: 'published', authorName: 'Marcus C.', readTime: 8, cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop' },
    { slug: 'a-quiet-rebrand',            title: 'A quiet rebrand',                     excerpt: "New marks, same conviction. The thinking behind Spay's 2026 identity.",  category: 'Design',      tags: ['brand','design'],           status: 'published', authorName: 'Theo N.',   readTime: 5, cover: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=630&fit=crop' },
    { slug: 'compliance-without-the-wall',title: 'Compliance, without the wall',         excerpt: 'How we kept the rigor and dropped the friction.',                       category: 'Compliance',  tags: ['kyc','compliance'],         status: 'published', authorName: 'Priya S.',  readTime: 7, cover: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop' },
    { slug: 'earning-idle-balances',      title: 'Earning idle balances',                excerpt: 'A walkthrough of staking and what 5% APY really means.',                category: 'Product',     tags: ['staking','earn'],           status: 'scheduled', authorName: 'Marcus C.', readTime: 6, cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop' },
    { slug: 'designing-for-trust',        title: 'Designing for trust',                  excerpt: "The interface decisions behind a financial app that doesn't feel like one.", category: 'Design',  tags: ['ux','trust'],               status: 'draft',     authorName: 'Theo N.',   readTime: 9, cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop' },
    { slug: 'cross-border-in-seconds',    title: 'Cross-border, in seconds',             excerpt: 'How we route SEPA, ACH, and on-chain transfers from a single send.',    category: 'Engineering', tags: ['payments','infra'],         status: 'published', authorName: 'Marcus C.', readTime: 7, cover: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&h=630&fit=crop' },
    { slug: 'what-we-dont-allow',         title: "What we don't allow",                  excerpt: 'Where Spay draws the line — and why those lines protect customers.',     category: 'Compliance',  tags: ['policy','trust'],           status: 'published', authorName: 'Priya S.',  readTime: 5, cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop' },
  ];
  for (const p of posts) {
    await Post.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          ...p,
          category: catMap[p.category],
          categoryName: p.category,
          content: tipDoc(`${p.excerpt} Edit this post in the CMS to add real content.`),
          publishedAt: p.status === 'published' ? new Date() : undefined,
          seo: { title: `${p.title} | Spay`, description: p.excerpt },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  logger.info(`[seed] posts: ${posts.length}`);

  // ─── Redirects ───────────────────────────────────────────────
  const redirects = [
    { from: '/old-pricing',     to: '/pricing'                },
    { from: '/legacy-card',     to: '/card-terms'             },
    { from: '/blog/old-launch', to: '/blog/why-we-built-spay'  },
    { from: '/help',            to: '/contact'                },
    { from: '/promo',           to: '/promo/spring'           },
    { from: '/jobs',            to: '/careers'                },
  ];
  for (const r of redirects) {
    await Redirect.findOneAndUpdate({ from: r.from }, { $set: r }, { upsert: true, setDefaultsOnInsert: true });
  }
  logger.info(`[seed] redirects: ${redirects.length}`);

  // ─── Settings ────────────────────────────────────────────────
  await Setting.findOneAndUpdate(
    { key: 'organization' },
    { $set: { value: {
      // Global structured-data — emitted as Organization on every page via the
      // root layout.
      name:        'Spay',
      legalName:   'Spay, Inc.',
      url:         'https://spay.finance',
      logo:        'https://spay.finance/og-default.webp',
      description: 'Spay is the money app where fiat and crypto live side by side.',
      sameAs: [
        'https://twitter.com/spay',
        'https://www.linkedin.com/company/spay',
      ],
      contactPoint: {
        telephone: '',
        email: 'hello@spay.finance',
        contactType: 'customer service',
      },
    } } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await Setting.findOneAndUpdate(
    { key: 'seo' },
    { $set: { value: {
      siteName: 'Spay',
      titleTemplate: '{title} | Spay',
      defaultDescription: 'Spay is the money app where fiat and crypto live side by side.',
      defaultOgImage: '/og-default.webp',
      twitterHandle: '@spay',
    } } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await Setting.findOneAndUpdate(
    { key: 'analytics' },
    { $set: { value: { ga4Id: '', gtmId: '', metaPixelId: '', headerScript: '', bodyScript: '', footerScript: '' } } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await Setting.findOneAndUpdate(
    { key: 'robots' },
    // Empty string = "no manual override". The website's /robots.txt
    // route handler will auto-generate from Crawler controls.
    { $set: { value: '' } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await Setting.findOneAndUpdate(
    { key: 'crawl' },
    {
      $set: {
        value: {
          // Default-noindex these URL patterns. Toggle from SEO Settings.
          noindexSearch:   true,  // any URL with ?q= or path starting with /search
          noindexTags:     true,  // /tag/* and /blog/tag/*
          noindexFiltered: true,  // any URL with query params (utm_*, page=, category=, etc.)
          // Treat these query params as "real content" and DON'T noindex them.
          // 'page' is here so paginated archives (/blog?page=2) stay crawlable.
          allowedQueryParams: ['slug', 'preview', 'page'],
          // Extra glob patterns to block (one per line, e.g. "/preview/*")
          extraNoindexPaths: '',
        },
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  logger.info('[seed] settings: 5');

  logger.info('[seed] done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error('[seed] failed', err);
  process.exit(1);
});
