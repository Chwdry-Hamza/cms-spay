/**
 * Homepage content model — CMS side.
 *
 * Mirrors spay-website/src/lib/homeContent.ts. The website owns the canonical
 * defaults (the live design copy); this copy is used by the CMS editor to seed
 * the form and show the current values when the saved `sections` are empty.
 *
 * KEEP THESE DEFAULTS IN SYNC with the website copy. The declarative
 * HOME_CONTENT_SCHEMA below drives the editor UI generically.
 */

export const HOME_CONTENT_DEFAULTS: Record<string, any> = {
  hero: {
    titleParts: [
      { text: 'THE ', color: '#ffffff' },
      { text: 'MONEY ', color: '#46F1C5' },
      { text: 'APP', color: '#ffffff' },
    ],
    subtitle:
      'Experience institutional-grade security with the agility of decentralized finance. Secure, fast, and rewarding crypto platform for the next generation.',
    mobileSubtitle: 'Secure, fast, and rewarding crypto platform.',
    ctaLabel: 'GET THE APP',
    ctaMobileLabel: 'GET APP',
    ctaUrl: 'https://apps.apple.com/app/sicash',
    heroImage: '/heroImageSpay.png',
    logoSrc: '/Spay.png',
    gradientStart: '#090e1c',
    gradientEnd: '#0e2e2e',
  },
  features: {
    eyebrow: 'A new era of digital banking',
    titleParts: [
      { text: 'TAKE ', color: '#ffffff' },
      { text: 'CONTROL', color: '#46F1C5' },
      { text: ' OF ALL\nYOUR ', color: '#ffffff' },
      { text: 'MONEY', color: '#46F1C5' },
    ],
    cards: [
      { title: 'TRANSACTION', desc: 'Manage all your finances with a single tap. Forget about banking hassles.', image: '/transactions.jpeg', bgStart: '#46F1C5', bgEnd: '#004132' },
      { title: 'CRYPTO', desc: 'Safely hold, effortlessly send, receive, and monitor your cryptocurrency holding.', image: '/crypto.jpeg', bgStart: '#46F1C5', bgEnd: '#004132' },
      { title: 'HISTORY', desc: 'Get a wide range of innovative financial tools for unlimited wealth-building opportunities.', image: '/notifications.jpeg', bgStart: '#46F1C5', bgEnd: '#004132' },
    ],
  },
  currencies: {
    tickers: [
      { pair: 'ETH/USD', price: '$3,452.12', change: '+1.4%' },
      { pair: 'TRX/USD', price: '$0.32', change: '+2.6%' },
      { pair: 'USDT (TRC20)', price: '$1.00', change: '+0.0%' },
      { pair: 'USDT (ERC20)', price: '$1.00', change: '+0.0%' },
      { pair: 'USDC (ERC20)', price: '$1.00', change: '+0.0%' },
    ],
  },
  payment: {
    eyebrow: 'Fiat and Crypto',
    titleParts: [
      { text: 'CHOOSE ', color: '#46F1C5' },
      { text: 'HOW TO PAY', color: '#ffffff' },
    ],
    subtitle: 'Switch between fiat and crypto in a Second',
    cardFront: '/spayFront.png',
    cardBack: '/spayBack.png',
    cardFrontAlt: 'SPAY Card Front',
    cardBackAlt: 'SPAY Card Back',
  },
  transfer: {
    eyebrow: 'TRANSFERS WITHOUT BARRIERS',
    titleParts: [
      { text: 'SEND ', color: '#ffffff' },
      { text: 'CRYPTO', color: '#46F1C5' },
      { text: ' EASILY,\nANYWHERE, TO ANYONE', color: '#ffffff' },
    ],
    subtitle:
      'Spend your crypto anywhere a card is accepted — our card and app make it as easy as using a regular bank card.',
    mockupImage: '/paymentMobile.png',
  },
  crypto: {
    eyebrow: 'MANAGE CRYPTO',
    titleParts: [
      { text: 'DEPOSIT AND INVEST WITH ', color: '#ffffff' },
      { text: 'SPAY', color: '#46F1C5' },
    ],
    subtitle:
      'Purchase, spend, sell, and hold cryptocurrencies, all from the convenience of your device. Delve into the world of digital currencies effortlessly.',
    mockupImage: '/tabletMobile.png',
  },
  featureGrid: {
    eyebrow: 'Your crypto, everyday spending',
    titleParts: [
      { text: 'PAY WITH ', color: '#FFFFFF' },
      { text: 'CRYPTO', color: '#46F1C5' },
      { text: ' ANYWHERE\nA CARD WORKS.', color: '#FFFFFF' },
    ],
    send: { label: 'Send', title: 'Send money in seconds, not days.', body: 'Move funds to friends, family, or any wallet — across the city or across the world. Every transfer settles instantly.', badgeText: '+ 50 USDC · 1.2s' },
    grow: { label: 'Grow', statValue: '5.0', statUnit: '% APY', body: 'Earn yield on your idle balance, paid out daily. No lockups, no minimums, withdraw anytime.' },
    spend: { label: 'Spend', title: 'Tap, swipe, or shop online — with crypto.', cardImage: '/spayFront.png' },
    split: { title: 'Spend crypto like cash, anywhere.', body: 'Tap your SPay card at any store or pay online — crypto converts to fiat at checkout, automatically.', amountText: '$37.42 each' },
    business: { title: 'For businesses, get paid in crypto.', body: 'Online checkouts, in-store payments, and crypto invoices — with same-day payouts to your wallet or bank.', pills: ['Online checkout', 'In-store POS', 'Crypto invoicing'] },
    protect: { label: 'Protect', title: 'Your funds, fully protected.', body: 'Multi-sig cold storage on every wallet. Biometric login on every device. 24/7 anomaly detection — your crypto stays yours, always.', pills: ['Multi-sig vault', 'Biometric login', 'SOC 2 Type II'] },
  },
  joinUs: {
    eyebrow: 'JOIN US',
    titleParts: [
      { text: 'TIME IS ', color: '#ffffff' },
      { text: 'MONEY', color: '#46F1C5' },
    ],
    subtitle:
      'Say goodbye to juggling multiple apps and tools for your financial transactions. SPay is your one-stop solution for all your money needs.',
    ctaLabel: 'GET SPAY APP',
    ctaUrl: 'https://apps.apple.com/app/sicash',
    photoGrid: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
    ],
  },
  collaborations: {
    headingBefore: 'OUR ',
    headingHighlight: 'COLLABORATIONS',
    partners: ['BitGo', 'FENIGE', 'INTERCOM', 'PLAID', 'QUICKO', 'onfido', 'Verestro', 'YAPILY', 'BINARYX'],
  },
  footer: {
    logo: '/Spay.png',
    tagline: 'THE MONEY APP',
    links: [
      { label: 'About SPay', href: '/about' },
      { label: 'Support', href: '/support' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Card Terms', href: '/card-terms' },
      { label: 'E-Sign Consent', href: '/e-sign-consent' },
      { label: 'Prohibited Activities', href: '/prohibited-activities' },
    ],
    copyright: '© 2026 SPay. All rights reserved.',
    appStoreUrl: 'https://apps.apple.com/app/sicash',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sicash',
  },
};

// ─── Declarative schema that drives the editor form ──────────────────────────

export type Field =
  | { type: 'text' | 'textarea' | 'image'; key: string; label: string }
  | { type: 'group'; key: string; label: string; fields: Field[] }
  | { type: 'objectList'; key: string; label: string; itemLabel: string; itemFields: Field[] }
  | { type: 'stringList'; key: string; label: string; itemLabel: string; itemType?: 'text' | 'image' };

export type SectionDef = { key: string; label: string; fields: Field[] };

const TITLE_PARTS: Field = {
  type: 'objectList', key: 'titleParts', label: 'Title', itemLabel: 'Part',
  itemFields: [
    { type: 'text', key: 'text', label: 'Text' },
  ],
};

export const HOME_CONTENT_SCHEMA: SectionDef[] = [
  {
    key: 'hero', label: 'Hero',
    fields: [
      TITLE_PARTS,
      { type: 'textarea', key: 'subtitle', label: 'Subtitle (desktop)' },
      { type: 'text', key: 'mobileSubtitle', label: 'Subtitle (mobile)' },
      { type: 'text', key: 'ctaLabel', label: 'CTA label (desktop)' },
      { type: 'text', key: 'ctaMobileLabel', label: 'CTA label (mobile)' },
      { type: 'text', key: 'ctaUrl', label: 'CTA link' },
      { type: 'image', key: 'heroImage', label: 'Hero image' },
      { type: 'image', key: 'logoSrc', label: 'Logo' },
    ],
  },
  {
    key: 'features', label: 'Features (3 cards)',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      {
        type: 'objectList', key: 'cards', label: 'Cards', itemLabel: 'Card',
        itemFields: [
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'textarea', key: 'desc', label: 'Description' },
          { type: 'image', key: 'image', label: 'Image' },
        ],
      },
    ],
  },
  {
    key: 'currencies', label: 'Currency ticker',
    fields: [
      {
        type: 'objectList', key: 'tickers', label: 'Tickers', itemLabel: 'Ticker',
        itemFields: [
          { type: 'text', key: 'pair', label: 'Pair' },
          { type: 'text', key: 'price', label: 'Price' },
          { type: 'text', key: 'change', label: 'Change' },
        ],
      },
    ],
  },
  {
    key: 'payment', label: 'Payment',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      { type: 'text', key: 'subtitle', label: 'Subtitle' },
      { type: 'image', key: 'cardFront', label: 'Card front image' },
      { type: 'image', key: 'cardBack', label: 'Card back image' },
      { type: 'text', key: 'cardFrontAlt', label: 'Card front alt text' },
      { type: 'text', key: 'cardBackAlt', label: 'Card back alt text' },
    ],
  },
  {
    key: 'transfer', label: 'Transfer',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      { type: 'textarea', key: 'subtitle', label: 'Subtitle' },
      { type: 'image', key: 'mockupImage', label: 'Mockup image' },
    ],
  },
  {
    key: 'crypto', label: 'Crypto',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      { type: 'textarea', key: 'subtitle', label: 'Subtitle' },
      { type: 'image', key: 'mockupImage', label: 'Mockup image' },
    ],
  },
  {
    key: 'featureGrid', label: 'Feature grid (6 tiles)',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      { type: 'group', key: 'send', label: 'Send tile', fields: [
        { type: 'text', key: 'label', label: 'Label' },
        { type: 'text', key: 'title', label: 'Title' },
        { type: 'textarea', key: 'body', label: 'Body' },
        { type: 'text', key: 'badgeText', label: 'Badge text' },
      ]},
      { type: 'group', key: 'grow', label: 'Grow tile', fields: [
        { type: 'text', key: 'label', label: 'Label' },
        { type: 'text', key: 'statValue', label: 'Stat value' },
        { type: 'text', key: 'statUnit', label: 'Stat unit' },
        { type: 'textarea', key: 'body', label: 'Body' },
      ]},
      { type: 'group', key: 'spend', label: 'Spend tile', fields: [
        { type: 'text', key: 'label', label: 'Label' },
        { type: 'text', key: 'title', label: 'Title' },
        { type: 'image', key: 'cardImage', label: 'Card image' },
      ]},
      { type: 'group', key: 'split', label: 'Split tile', fields: [
        { type: 'text', key: 'title', label: 'Title' },
        { type: 'textarea', key: 'body', label: 'Body' },
        { type: 'text', key: 'amountText', label: 'Amount text' },
      ]},
      { type: 'group', key: 'business', label: 'Business tile', fields: [
        { type: 'text', key: 'title', label: 'Title' },
        { type: 'textarea', key: 'body', label: 'Body' },
        { type: 'stringList', key: 'pills', label: 'Pills', itemLabel: 'Pill' },
      ]},
      { type: 'group', key: 'protect', label: 'Protect tile', fields: [
        { type: 'text', key: 'label', label: 'Label' },
        { type: 'text', key: 'title', label: 'Title' },
        { type: 'textarea', key: 'body', label: 'Body' },
        { type: 'stringList', key: 'pills', label: 'Pills', itemLabel: 'Pill' },
      ]},
    ],
  },
  {
    key: 'joinUs', label: 'Join us',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      TITLE_PARTS,
      { type: 'textarea', key: 'subtitle', label: 'Subtitle' },
      { type: 'text', key: 'ctaLabel', label: 'CTA label' },
      { type: 'text', key: 'ctaUrl', label: 'CTA link' },
      { type: 'stringList', key: 'photoGrid', label: 'Photo grid', itemLabel: 'Photo', itemType: 'image' },
    ],
  },
  {
    key: 'collaborations', label: 'Collaborations',
    fields: [
      { type: 'text', key: 'headingBefore', label: 'Heading (white part)' },
      { type: 'text', key: 'headingHighlight', label: 'Heading (accent part)' },
      { type: 'stringList', key: 'partners', label: 'Partner names', itemLabel: 'Partner' },
    ],
  },
  {
    key: 'footer', label: 'Footer',
    fields: [
      { type: 'image', key: 'logo', label: 'Logo' },
      { type: 'text', key: 'tagline', label: 'Tagline' },
      {
        type: 'objectList', key: 'links', label: 'Links', itemLabel: 'Link',
        itemFields: [
          { type: 'text', key: 'label', label: 'Label' },
          { type: 'text', key: 'href', label: 'URL' },
        ],
      },
      { type: 'text', key: 'copyright', label: 'Copyright' },
      { type: 'text', key: 'appStoreUrl', label: 'App Store URL' },
      { type: 'text', key: 'playStoreUrl', label: 'Google Play URL' },
    ],
  },
];

// Deep-merge saved overrides onto the defaults (arrays merge by index), so the
// form always shows complete current values. Mirrors the website resolver.
function mergeValue(def: any, raw: any): any {
  if (raw === undefined || raw === null) return def;
  if (Array.isArray(def)) {
    const rawArr = Array.isArray(raw) ? raw : [];
    return def.map((d, i) => mergeValue(d, rawArr[i]));
  }
  if (def && typeof def === 'object') {
    if (typeof raw !== 'object' || Array.isArray(raw)) return def;
    const out: Record<string, any> = {};
    for (const k of Object.keys(def)) out[k] = mergeValue(def[k], raw[k]);
    return out;
  }
  return raw;
}

export function resolveHomeContent(raw: any): Record<string, any> {
  return mergeValue(HOME_CONTENT_DEFAULTS, raw ?? {});
}
