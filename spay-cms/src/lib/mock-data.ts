export type ContentStatus = 'draft' | 'published' | 'scheduled';

export type Page = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  author: string;
  updatedAt: string;
  publishedAt: string | null;
  template: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: ContentStatus;
  author: string;
  updatedAt: string;
  publishedAt: string | null;
  readTime: number;
  cover: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color: string;
};

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mime: string;
  width?: number;
  height?: number;
  alt: string;
  uploadedAt: string;
  isWebP?: boolean;
};

export type Redirect = {
  id: string;
  from: string;
  to: string;
  statusCode: 301 | 302 | 307 | 308;
  hits: number;
  createdAt: string;
  enabled: boolean;
};

export type Log404 = {
  id: string;
  url: string;
  referrer: string;
  userAgent: string;
  hits: number;
  lastSeen: string;
  resolved: boolean;
};

export const PAGES: Page[] = [
  { id: 'p1',  title: 'Home',                         slug: '/',                      status: 'published', author: 'Aria S.',   updatedAt: '2026-05-19T10:24:00Z', publishedAt: '2026-04-02T08:00:00Z', template: 'Landing' },
  { id: 'p2',  title: 'About Spay',                    slug: '/about',                 status: 'published', author: 'Theo N.',   updatedAt: '2026-05-15T14:00:00Z', publishedAt: '2026-04-10T08:00:00Z', template: 'Content' },
  { id: 'p3',  title: 'Card Terms',                   slug: '/card-terms',            status: 'published', author: 'Priya S.',  updatedAt: '2026-05-15T09:30:00Z', publishedAt: '2026-04-12T08:00:00Z', template: 'Legal' },
  { id: 'p4',  title: 'Privacy Policy',               slug: '/privacy-policy',        status: 'published', author: 'Priya S.',  updatedAt: '2026-05-15T09:31:00Z', publishedAt: '2026-04-12T08:00:00Z', template: 'Legal' },
  { id: 'p5',  title: 'Prohibited Activities',        slug: '/prohibited-activities', status: 'published', author: 'Priya S.',  updatedAt: '2026-05-15T09:32:00Z', publishedAt: '2026-04-12T08:00:00Z', template: 'Legal' },
  { id: 'p6',  title: 'Crypto Card',                  slug: '/crypto-card',           status: 'scheduled', author: 'Marcus C.', updatedAt: '2026-05-20T16:00:00Z', publishedAt: '2026-05-25T14:00:00Z', template: 'Product' },
  { id: 'p7',  title: 'Send Money',                   slug: '/send',                  status: 'draft',     author: 'Elena V.',  updatedAt: '2026-05-21T08:12:00Z', publishedAt: null,                   template: 'Product' },
  { id: 'p8',  title: 'Earn',                         slug: '/earn',                  status: 'published', author: 'Marcus C.', updatedAt: '2026-05-18T11:48:00Z', publishedAt: '2026-04-22T08:00:00Z', template: 'Product' },
  { id: 'p9',  title: 'Pricing',                      slug: '/pricing',               status: 'draft',     author: 'Theo N.',   updatedAt: '2026-05-21T07:02:00Z', publishedAt: null,                   template: 'Marketing' },
  { id: 'p10', title: 'Contact',                      slug: '/contact',               status: 'published', author: 'Jordan R.', updatedAt: '2026-05-10T12:00:00Z', publishedAt: '2026-04-18T08:00:00Z', template: 'Form' },
  { id: 'p11', title: 'Careers',                      slug: '/careers',               status: 'published', author: 'Theo N.',   updatedAt: '2026-05-12T09:00:00Z', publishedAt: '2026-04-20T08:00:00Z', template: 'Content' },
  { id: 'p12', title: 'Press',                        slug: '/press',                 status: 'published', author: 'Theo N.',   updatedAt: '2026-05-08T10:00:00Z', publishedAt: '2026-04-22T08:00:00Z', template: 'Content' },
];

export const POSTS: Post[] = [
  { id: 'b1', title: 'Why we built Spay',                        slug: '/blog/why-we-built-spay',              excerpt: 'A founder note on the gap between how money moves and how people live.', category: 'Company',     tags: ['founders', 'story'],          status: 'published', author: 'Aria S.',   updatedAt: '2026-05-18T10:00:00Z', publishedAt: '2026-05-12T09:00:00Z', readTime: 6,  cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop' },
  { id: 'b2', title: 'Stablecoins at checkout, finally',         slug: '/blog/stablecoins-at-checkout',       excerpt: 'How USDC moves the merchant economics in your favor.',                  category: 'Crypto',      tags: ['stablecoins','merchants'],     status: 'published', author: 'Marcus C.', updatedAt: '2026-05-15T11:00:00Z', publishedAt: '2026-05-08T09:00:00Z', readTime: 8,  cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop' },
  { id: 'b3', title: 'A quiet rebrand',                          slug: '/blog/a-quiet-rebrand',               excerpt: 'New marks, same conviction. The thinking behind Spay\'s 2026 identity.',  category: 'Design',      tags: ['brand','design'],              status: 'published', author: 'Theo N.',   updatedAt: '2026-05-10T11:00:00Z', publishedAt: '2026-05-01T09:00:00Z', readTime: 5,  cover: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=630&fit=crop' },
  { id: 'b4', title: 'Compliance, without the wall',             slug: '/blog/compliance-without-the-wall',   excerpt: 'How we kept the rigor and dropped the friction.',                       category: 'Compliance',  tags: ['kyc','compliance'],            status: 'published', author: 'Priya S.',  updatedAt: '2026-05-04T11:00:00Z', publishedAt: '2026-04-26T09:00:00Z', readTime: 7,  cover: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop' },
  { id: 'b5', title: 'Earning idle balances',                    slug: '/blog/earning-idle-balances',         excerpt: 'A walkthrough of staking and what 5% APY really means.',                category: 'Product',     tags: ['staking','earn'],              status: 'scheduled', author: 'Marcus C.', updatedAt: '2026-05-20T13:00:00Z', publishedAt: '2026-05-24T09:00:00Z', readTime: 6,  cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop' },
  { id: 'b6', title: 'Designing for trust',                      slug: '/blog/designing-for-trust',           excerpt: 'The interface decisions behind a financial app that doesn\'t feel like one.', category: 'Design',  tags: ['ux','trust'],                  status: 'draft',     author: 'Theo N.',   updatedAt: '2026-05-21T07:00:00Z', publishedAt: null,                   readTime: 9,  cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop' },
  { id: 'b7', title: 'Cross-border, in seconds',                 slug: '/blog/cross-border-in-seconds',       excerpt: 'How we route SEPA, ACH, and on-chain transfers from a single send.',    category: 'Engineering', tags: ['payments','infra'],            status: 'published', author: 'Marcus C.', updatedAt: '2026-04-28T11:00:00Z', publishedAt: '2026-04-20T09:00:00Z', readTime: 7,  cover: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&h=630&fit=crop' },
  { id: 'b8', title: 'What we don\'t allow',                     slug: '/blog/what-we-dont-allow',            excerpt: 'Where Spay draws the line — and why those lines protect customers.',     category: 'Compliance',  tags: ['policy','trust'],              status: 'published', author: 'Priya S.',  updatedAt: '2026-04-22T10:00:00Z', publishedAt: '2026-04-15T09:00:00Z', readTime: 5,  cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop' },
];

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Company',     slug: 'company',     description: 'Founders\' notes and team updates.',         postCount: 6,  color: '#6FE3FF' },
  { id: 'c2', name: 'Crypto',      slug: 'crypto',      description: 'On-chain, stablecoins, and digital assets.', postCount: 14, color: '#3AE6B0' },
  { id: 'c3', name: 'Product',     slug: 'product',     description: 'Launches, features, and roadmap.',           postCount: 22, color: '#FFCE5C' },
  { id: 'c4', name: 'Design',      slug: 'design',      description: 'Brand, UI, and craft.',                      postCount: 8,  color: '#C66BFF' },
  { id: 'c5', name: 'Engineering', slug: 'engineering', description: 'Infra, payments rails, and security.',        postCount: 11, color: '#4ECBFF' },
  { id: 'c6', name: 'Compliance',  slug: 'compliance',  description: 'Policy, KYC, and trust.',                    postCount: 5,  color: '#FF5E87' },
];

export const MEDIA: MediaItem[] = [
  { id: 'm1',  name: 'hero-phone.webp',         url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=600&fit=crop', type: 'image', size: 184_320, mime: 'image/webp', width: 1200, height: 1200, alt: 'Phone showing Spay app',           uploadedAt: '2026-05-18T10:00:00Z', isWebP: true },
  { id: 'm2',  name: 'card-front.webp',         url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=600&fit=crop',  type: 'image', size: 142_402, mime: 'image/webp', width: 1600, height: 1000, alt: 'Spay card front',                  uploadedAt: '2026-05-17T10:00:00Z', isWebP: true },
  { id: 'm3',  name: 'card-back.webp',          url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&h=600&fit=crop',type: 'image', size: 138_021, mime: 'image/webp', width: 1600, height: 1000, alt: 'Spay card back',                   uploadedAt: '2026-05-17T10:01:00Z', isWebP: true },
  { id: 'm4',  name: 'team-aria.jpg',           url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face', type: 'image', size: 84_120, mime: 'image/jpeg', width: 800, height: 800, alt: 'Aria Sinclair, CEO',  uploadedAt: '2026-05-10T10:00:00Z' },
  { id: 'm5',  name: 'team-marcus.jpg',         url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face', type: 'image', size: 92_408, mime: 'image/jpeg', width: 800, height: 800, alt: 'Marcus Chen, CTO',     uploadedAt: '2026-05-10T10:01:00Z' },
  { id: 'm6',  name: 'team-elena.jpg',          url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face', type: 'image', size: 86_204, mime: 'image/jpeg', width: 800, height: 800, alt: 'Elena Vasquez, COO',   uploadedAt: '2026-05-10T10:02:00Z' },
  { id: 'm7',  name: 'office-1.webp',           url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=600&fit=crop',type: 'image', size: 224_018, mime: 'image/webp', width: 1600, height: 1200, alt: 'Brooklyn office',                 uploadedAt: '2026-05-05T10:00:00Z', isWebP: true },
  { id: 'm8',  name: 'crypto-bg.webp',          url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=600&fit=crop',type: 'image', size: 198_320, mime: 'image/webp', width: 1600, height: 900,  alt: 'Crypto abstract background',      uploadedAt: '2026-04-28T10:00:00Z', isWebP: true },
  { id: 'm9',  name: 'press-kit.pdf',           url: '#',                                                                                  type: 'document', size: 2_404_120, mime: 'application/pdf',                                                                                       alt: 'Press kit', uploadedAt: '2026-04-20T10:00:00Z' },
  { id: 'm10', name: 'product-demo.mp4',        url: '#',                                                                                  type: 'video', size: 18_204_120, mime: 'video/mp4', width: 1920, height: 1080,                                                                  alt: 'Product walkthrough', uploadedAt: '2026-04-12T10:00:00Z' },
  { id: 'm11', name: 'send-money.webp',         url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=600&h=600&fit=crop',type: 'image', size: 148_020, mime: 'image/webp', width: 1600, height: 1000, alt: 'Money transfer interface',         uploadedAt: '2026-04-10T10:00:00Z', isWebP: true },
  { id: 'm12', name: 'compliance.webp',         url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=600&fit=crop',type: 'image', size: 162_004, mime: 'image/webp', width: 1600, height: 1000, alt: 'Compliance documents',             uploadedAt: '2026-04-05T10:00:00Z', isWebP: true },
];

export const REDIRECTS: Redirect[] = [
  { id: 'r1', from: '/old-pricing',     to: '/pricing',         statusCode: 301, hits: 4_812, createdAt: '2026-03-12T10:00:00Z', enabled: true  },
  { id: 'r2', from: '/legacy-card',     to: '/card-terms',      statusCode: 301, hits: 1_402, createdAt: '2026-03-10T10:00:00Z', enabled: true  },
  { id: 'r3', from: '/blog/old-launch', to: '/blog/why-we-built-spay', statusCode: 301, hits: 824, createdAt: '2026-04-01T10:00:00Z', enabled: true  },
  { id: 'r4', from: '/help',            to: '/contact',         statusCode: 301, hits: 12_408, createdAt: '2026-02-22T10:00:00Z', enabled: true  },
  { id: 'r5', from: '/api/v1/*',        to: '/api/v2/*',        statusCode: 308, hits: 38_412, createdAt: '2026-02-01T10:00:00Z', enabled: true  },
  { id: 'r6', from: '/promo',           to: '/promo/spring',    statusCode: 302, hits: 2_104, createdAt: '2026-04-20T10:00:00Z', enabled: false },
  { id: 'r7', from: '/team',            to: '/about#team',      statusCode: 301, hits: 612,  createdAt: '2026-04-22T10:00:00Z', enabled: true  },
  { id: 'r8', from: '/jobs',            to: '/careers',         statusCode: 301, hits: 3_802, createdAt: '2026-04-25T10:00:00Z', enabled: true  },
];

export const LOGS_404: Log404[] = [
  { id: 'l1', url: '/blog/2025-recap',          referrer: 'google.com',           userAgent: 'Chrome 126',  hits: 1_204, lastSeen: '2026-05-21T08:14:00Z', resolved: false },
  { id: 'l2', url: '/wallets',                  referrer: 'direct',               userAgent: 'Safari iOS',  hits: 824,   lastSeen: '2026-05-21T07:42:00Z', resolved: false },
  { id: 'l3', url: '/api/v1/users',             referrer: 'docs.spay.finance',     userAgent: 'curl/8.5',    hits: 612,   lastSeen: '2026-05-21T06:30:00Z', resolved: false },
  { id: 'l4', url: '/press-2025',               referrer: 'twitter.com',          userAgent: 'Chrome 126',  hits: 412,   lastSeen: '2026-05-21T05:00:00Z', resolved: false },
  { id: 'l5', url: '/blog/old-launch',          referrer: 'linkedin.com',         userAgent: 'Chrome 126',  hits: 308,   lastSeen: '2026-05-20T22:00:00Z', resolved: true  },
  { id: 'l6', url: '/help/refunds',             referrer: 'google.com',           userAgent: 'Edge 124',    hits: 244,   lastSeen: '2026-05-20T18:00:00Z', resolved: false },
  { id: 'l7', url: '/promo-2024',               referrer: 'direct',               userAgent: 'Chrome 126',  hits: 188,   lastSeen: '2026-05-20T14:00:00Z', resolved: false },
  { id: 'l8', url: '/about-us',                 referrer: 'duckduckgo.com',       userAgent: 'Firefox 128', hits: 144,   lastSeen: '2026-05-20T12:00:00Z', resolved: false },
];

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard',           href: '/',                  icon: 'LayoutDashboard' },
  { label: 'Pages',               href: '/pages',             icon: 'FileText' },
  { label: 'Blog Posts',          href: '/posts',             icon: 'NotebookPen' },
  { label: 'Categories',          href: '/categories',        icon: 'Folder' },
  { label: 'Media Library',       href: '/media',             icon: 'Image' },
  { label: 'Redirects',           href: '/redirects',         icon: 'ArrowRightLeft' },
  { label: 'SEO Settings',        href: '/seo',               icon: 'Search' },
  { label: 'Sitemap',             href: '/sitemap',           icon: 'Network' },
  { label: '404 Logs',            href: '/logs-404',          icon: 'AlertOctagon' },
  { label: 'Analytics Settings',  href: '/analytics',         icon: 'BarChart3' },
] as const;

export const TEMPLATES = ['Landing', 'Content', 'Product', 'Marketing', 'Legal', 'Form'] as const;

export const COMMAND_ITEMS = [
  { group: 'Navigate', items: [
    { label: 'Go to Dashboard',       href: '/',          shortcut: 'G D' },
    { label: 'Go to Pages',           href: '/pages',     shortcut: 'G P' },
    { label: 'Go to Blog Posts',      href: '/posts',     shortcut: 'G B' },
    { label: 'Go to Media Library',   href: '/media',     shortcut: 'G M' },
    { label: 'Go to Redirects',       href: '/redirects', shortcut: 'G R' },
    { label: 'Go to SEO Settings',    href: '/seo',       shortcut: 'G S' },
  ]},
];
