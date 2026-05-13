/**
 * Section catalogue — mirrors `cms/src/views/builder/sectionsData.ts`.
 *
 * Adding a new section type:
 *   1. Append a CatalogueEntry below.
 *   2. Add its content schema in `sections.content.schemas.ts` and extend
 *      the SectionContentZ discriminated union.
 *   3. Restart the server. The "Add new section" endpoint and the inspector
 *      pick it up automatically.
 */

export type SectionType =
  | 'appHeader'
  | 'homeHero'
  | 'features'
  | 'currencies'
  | 'featureGrid'
  | 'payment'
  | 'transfer'
  | 'earn'
  | 'crypto'
  | 'linkedAccounts'
  | 'collaborations'
  | 'joinUs'
  | 'customSection'
  | 'footer'
  | 'bottomNav'
  | 'cookieConsent';

export interface CatalogueEntry {
  key: string;
  type: SectionType;
  defaultName: string;
  defaultFile: string;
  defaultIcon: string;
  locked: boolean;
  description: string;
  defaultData: Record<string, unknown>;
}

export const SECTION_CATALOGUE: CatalogueEntry[] = [
  {
    key: 'appHeader',
    type: 'appHeader',
    defaultName: 'App Header',
    defaultFile: 'AppHeader.tsx',
    defaultIcon: 'header',
    locked: true,
    description: 'Top sticky navigation bar with logo and primary CTA.',
    defaultData: {
      logoSrc: '/Spay.png',
      logoAlt: 'Spay',
      ctaLabel: 'GET SPAY APP',
      ctaUrl: 'https://apps.apple.com/app/sicash',
      ctaMobileLabel: 'GET APP',
      sticky: true,
      blur: true,
    },
  },
  {
    key: 'homeHero',
    type: 'homeHero',
    defaultName: 'Home Hero',
    defaultFile: 'HomeHero.tsx',
    defaultIcon: 'rocket',
    locked: false,
    description: 'Headline, subtitle, primary CTA, and product mockup.',
    defaultData: {
      eyebrow: '',
      titleParts: [
        { text: 'THE ', color: '#ffffff' },
        { text: 'MONEY ', color: '#46F1C5' },
        { text: 'APP', color: '#ffffff' },
      ],
      subtitle:
        'Experience institutional-grade security with the agility of decentralized finance. Secure, fast, and rewarding crypto platform for the next generation.',
      mobileSubtitle: 'Secure, fast, and rewarding crypto platform.',
      ctaLabel: 'GET THE APP',
      ctaUrl: 'https://apps.apple.com/app/sicash',
      heroImage: '/heroImageSpay.png',
      gradientStart: '#090e1c',
      gradientEnd: '#0e2e2e',
      glowColor: '#0e2e2e',
    },
  },
  {
    key: 'features',
    type: 'features',
    defaultName: 'Features Section',
    defaultFile: 'FeaturesSection.tsx',
    defaultIcon: 'grid',
    locked: false,
    description: 'Three feature cards: Transaction, Crypto, History.',
    defaultData: {
      eyebrow: 'A new era of digital banking',
      titleParts: [
        { text: 'TAKE ', color: '#ffffff' },
        { text: 'CONTROL', color: '#46F1C5' },
        { text: ' OF ALL\nYOUR ', color: '#ffffff' },
        { text: 'MONEY', color: '#46F1C5' },
      ],
      cards: [
        {
          title: 'TRANSACTION',
          desc: 'Manage all your finances with a single tap. Forget about banking hassles.',
          image: '/transactions.jpeg',
          bgStart: '#46F1C5',
          bgEnd: '#004132',
        },
        {
          title: 'CRYPTO',
          desc: 'Safely hold, effortlessly send, receive, and monitor your cryptocurrency holding.',
          image: '/crypto.jpeg',
          bgStart: '#46F1C5',
          bgEnd: '#004132',
        },
        {
          title: 'HISTORY',
          desc: 'Get a wide range of innovative financial tools for unlimited wealth-building opportunities.',
          image: '/notifications.jpeg',
          bgStart: '#46F1C5',
          bgEnd: '#004132',
        },
      ],
    },
  },
  {
    key: 'currencies',
    type: 'currencies',
    defaultName: 'Currencies Ticker',
    defaultFile: 'currencies.tsx',
    defaultIcon: 'trend-up',
    locked: false,
    description: 'Scrolling crypto/fiat ticker rail.',
    defaultData: {
      tickers: [
        { pair: 'ETH/USD', price: '$3,452.12', change: '+1.4%' },
        { pair: 'TRX/USD', price: '$0.32', change: '+2.6%' },
        { pair: 'USDT (TRC20)', price: '$1.00', change: '+0.0%' },
        { pair: 'USDT (ERC20)', price: '$1.00', change: '+0.0%' },
        { pair: 'USDC (ERC20)', price: '$1.00', change: '+0.0%' },
      ],
      scrollSeconds: 40,
    },
  },
  {
    key: 'featureGrid',
    type: 'featureGrid',
    defaultName: 'Feature Grid',
    defaultFile: 'FeatureGrid.tsx',
    defaultIcon: 'puzzle',
    locked: false,
    description: 'Mosaic of supporting feature highlights.',
    defaultData: {
      eyebrow: 'Your crypto, everyday spending',
      titleParts: [
        { text: 'PAY WITH ', color: '#FFFFFF' },
        { text: 'CRYPTO', color: '#46F1C5' },
        { text: ' ANYWHERE\nA CARD WORKS.', color: '#FFFFFF' },
      ],
      send: {
        label: 'Send',
        title: 'Send money in seconds, not days.',
        body: 'Move funds to friends, family, or any wallet — across the city or across the world. Every transfer settles instantly.',
        badgeText: '+ 50 USDC · 1.2s',
      },
      grow: {
        label: 'Grow',
        statValue: '5.0',
        statUnit: '% APY',
        body: 'Earn yield on your idle balance, paid out daily. No lockups, no minimums, withdraw anytime.',
      },
      spend: {
        label: 'Spend',
        title: 'Tap, swipe, or shop online — with crypto.',
        cardImage: '/spayFront.png',
      },
      split: {
        title: 'Spend crypto like cash, anywhere.',
        body: 'Tap your SPay card at any store or pay online — crypto converts to fiat at checkout, automatically.',
        amountText: '$37.42 each',
      },
      business: {
        title: 'For businesses, get paid in crypto.',
        body: 'Online checkouts, in-store payments, and crypto invoices — with same-day payouts to your wallet or bank.',
        pills: ['Online checkout', 'In-store POS', 'Crypto invoicing'],
      },
      protect: {
        label: 'Protect',
        title: 'Your funds, fully protected.',
        body: 'Multi-sig cold storage on every wallet. Biometric login on every device. 24/7 anomaly detection — your crypto stays yours, always.',
        pills: ['Multi-sig vault', 'Biometric login', 'SOC 2 Type II'],
      },
    },
  },
  {
    key: 'payment',
    type: 'payment',
    defaultName: 'Payment Section',
    defaultFile: 'PaymentSection.tsx',
    defaultIcon: 'card',
    locked: false,
    description: 'Spay card with flippable front/back.',
    defaultData: {
      eyebrow: 'FIAT AND CRYPTO',
      titleParts: [
        { text: 'CHOOSE ', color: '#46F1C5' },
        { text: 'HOW TO PAY', color: '#ffffff' },
      ],
      subtitle: 'Switch between fiat and crypto in a Second',
      cardFront: '/spayFront.png',
      cardBack: '/spayBack.png',
      flipOnHover: true,
    },
  },
  {
    key: 'transfer',
    type: 'transfer',
    defaultName: 'Transfer Section',
    defaultFile: 'TransferSection.tsx',
    defaultIcon: 'arrow-right',
    locked: false,
    description: 'Crypto-anywhere card spend story with phone mockup.',
    defaultData: {
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
  },
  {
    key: 'earn',
    type: 'earn',
    defaultName: 'Earn Section',
    defaultFile: 'EarnSection.tsx',
    defaultIcon: 'trend-up',
    locked: false,
    description: 'Staking pitch with APR gauge visual.',
    defaultData: {
      eyebrow: 'EARN WITH SPAY',
      titleParts: [
        { text: 'MAKE ', color: '#ffffff' },
        { text: 'CRYPTO', color: '#46F1C5' },
        { text: '\nWORK FOR YOU', color: '#ffffff' },
      ],
      subtitle:
        'Enjoy the crypto staking benefits provided by highly-secured cutting-edge encrypted solutions',
      apr: '3%',
      aprLabel: 'APR up to',
    },
  },
  {
    key: 'crypto',
    type: 'crypto',
    defaultName: 'Crypto Section',
    defaultFile: 'CryptoSection.tsx',
    defaultIcon: 'branch',
    locked: false,
    description: 'Manage and deposit crypto with phone mockup.',
    defaultData: {
      eyebrow: 'MANAGE CRYPTO',
      titleParts: [
        { text: 'DEPOSIT AND INVEST WITH ', color: '#ffffff' },
        { text: 'SPAY', color: '#46F1C5' },
      ],
      subtitle:
        'Purchase, spend, sell, and hold cryptocurrencies, all from the convenience of your device. Delve into the world of digital currencies effortlessly.',
      mockupImage: '/tabletMobile.png',
    },
  },
  {
    key: 'linkedAccounts',
    type: 'linkedAccounts',
    defaultName: 'Linked Accounts',
    defaultFile: 'LinkedAccountsSection.tsx',
    defaultIcon: 'link',
    locked: false,
    description: 'Fanned crypto wallet cards with linked-success popup and globe.',
    defaultData: {
      eyebrow: 'LINKED ACCOUNTS',
      titleParts: [
        { text: 'USE YOUR OTHER\n', color: '#ffffff' },
        { text: 'CRYPTO ACCOUNTS', color: '#46F1C5' },
      ],
      subtitle:
        'Safely connect your crypto accounts to the app and manage them all from one secure access point.',
      centerCard: {
        name: 'Alexander Reed',
        status: 'Online',
        label: 'All Accounts',
        balance: '$23,569',
      },
      wallets: [
        { name: 'Alexander Reed', status: 'Online', label: 'CRYPTO WALLET 2', balance: '$ 8,724' },
        { name: 'Alexander Reed', status: 'Online', label: 'CRYPTO WALLET 1', balance: '$ 9,824' },
        { name: 'Alexander Reed', status: 'Online', label: 'CRYPTO WALLET 3', balance: '$ 3,960' },
        { name: 'Alexander Reed', status: 'Online', label: 'CRYPTO WALLET 4', balance: '$ 5,532' },
      ],
      popup: {
        title: 'SUCCESSFUL LINKED',
        body: 'You have successfully connected your external crypto account. Thank you for using us.',
        ctaLabel: 'CHECK IT OUT',
        ctaUrl: 'https://apps.apple.com/app/sicash',
      },
    },
  },
  {
    key: 'collaborations',
    type: 'collaborations',
    defaultName: 'Collaborations',
    defaultFile: 'CollaborationsSection.tsx',
    defaultIcon: 'users',
    locked: false,
    description: 'Partner & integration marquee.',
    defaultData: {
      titleParts: [
        { text: 'OUR ', color: '#ffffff' },
        { text: 'COLLABORATIONS', color: '#46F1C5' },
      ],
      partners: [
        { name: 'BitGo', icon: '₿' },
        { name: 'FENIGE', icon: '◆' },
        { name: 'INTERCOM', icon: '▦' },
        { name: 'PLAID', icon: '▣' },
        { name: 'QUICKO', icon: '◯' },
      ],
    },
  },
  {
    key: 'joinUs',
    type: 'joinUs',
    defaultName: 'Join Us',
    defaultFile: 'JoinUsSection.tsx',
    defaultIcon: 'sparkles',
    locked: false,
    description: 'Final conversion section with team photo grid background.',
    defaultData: {
      eyebrow: 'JOIN US',
      titleParts: [
        { text: 'TIME IS ', color: '#ffffff' },
        { text: 'MONEY', color: '#46F1C5' },
      ],
      subtitle: 'Be among the first to experience the next-gen money app.',
      ctaLabel: 'GET THE APP',
      ctaUrl: 'https://apps.apple.com/app/sicash',
      photos: [
        '/martha.png',
        '/inna.png',
        '/svitlana.png',
        '/mykhail.png',
        '/micheal.png',
        '/vladslav.png',
      ],
    },
  },
  {
    key: 'customSection',
    type: 'customSection',
    defaultName: 'Custom Section',
    defaultFile: 'CustomSection.tsx',
    defaultIcon: 'wand',
    locked: false,
    description: 'Free-form section with title, body, image and CTA. Pick a layout.',
    defaultData: {
      layout: 'text-only',
      eyebrow: 'NEW SECTION',
      titleParts: [
        { text: 'YOUR ', color: '#ffffff' },
        { text: 'CUSTOM', color: '#46F1C5' },
        { text: ' SECTION', color: '#ffffff' },
      ],
      subtitle:
        'Describe what this section is about. Edit copy, image and call-to-action from the inspector on the right.',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
    },
  },
  {
    key: 'footer',
    type: 'footer',
    defaultName: 'Footer',
    defaultFile: 'Footer.tsx',
    defaultIcon: 'footer',
    locked: true,
    description: 'Site footer with links, app stores, and copyright.',
    defaultData: {
      tagline: 'THE MONEY APP',
      links: [
        { label: 'About SPay', href: '/about' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Card Terms', href: '/card-terms' },
        { label: 'E-Sign Consent', href: '/e-sign-consent' },
        { label: 'Prohibited Activities', href: '/prohibited-activities' },
      ],
      copyright: '© 2026 SPay. All rights reserved.',
      appStoreUrl: 'https://apps.apple.com/app/sicash',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sicash',
    },
  },
  {
    key: 'bottomNav',
    type: 'bottomNav',
    defaultName: 'Mobile Bottom Nav',
    defaultFile: 'BottomNav.tsx',
    defaultIcon: 'mobile',
    locked: false,
    description: 'Mobile-only persistent action bar.',
    defaultData: {
      items: [
        { label: 'Home', icon: 'dashboard', href: '/' },
        { label: 'Card', icon: 'card', href: '/payment' },
        { label: 'Transfer', icon: 'arrow-right', href: '/transfer' },
        { label: 'Earn', icon: 'trend-up', href: '/earn' },
      ],
    },
  },
  {
    key: 'cookieConsent',
    type: 'cookieConsent',
    defaultName: 'Cookie Consent',
    defaultFile: 'CookieConsent.tsx',
    defaultIcon: 'cookie',
    locked: false,
    description: 'GDPR cookie acceptance banner.',
    defaultData: {
      message:
        'We use cookies to enhance your experience. By continuing to visit this site, you accept our use of cookies.',
      acceptLabel: 'Accept',
      declineLabel: 'Decline',
      learnMoreUrl: '/privacy-policy',
    },
  },
];

const byKey = new Map(SECTION_CATALOGUE.map((e) => [e.key, e]));
export const getCatalogueEntry = (key: string): CatalogueEntry | undefined => byKey.get(key);
