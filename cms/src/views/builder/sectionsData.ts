import type { IconName } from "@/components/Icon";

export type SectionType =
  | "appHeader"
  | "homeHero"
  | "features"
  | "featureGrid"
  | "payment"
  | "transfer"
  | "earn"
  | "crypto"
  | "linkedAccounts"
  | "collaborations"
  | "joinUs"
  | "footer"
  | "bottomNav"
  | "cookieConsent";

export type SectionMeta = {
  id: string;
  type: SectionType;
  name: string;
  file: string;
  icon: IconName;
  visible: boolean;
  locked?: boolean;
  description: string;
  data: Record<string, unknown>;
};

export const INITIAL_SECTIONS: SectionMeta[] = [
  {
    id: "appHeader",
    type: "appHeader",
    name: "App Header",
    file: "AppHeader.tsx",
    icon: "header",
    visible: true,
    locked: true,
    description: "Top sticky navigation bar with logo and primary CTA.",
    data: {
      logoSrc: "/Spay.png",
      logoAlt: "Spay",
      ctaLabel: "GET SPAY APP",
      ctaUrl: "https://apps.apple.com/app/sicash",
      ctaMobileLabel: "GET APP",
      sticky: true,
      blur: true,
    },
  },
  {
    id: "homeHero",
    type: "homeHero",
    name: "Home Hero",
    file: "HomeHero.tsx",
    icon: "rocket",
    visible: true,
    description: "Headline, subtitle, primary CTA, and product mockup.",
    data: {
      eyebrow: "",
      titleParts: [
        { text: "THE ", color: "#ffffff" },
        { text: "MONEY ", color: "#46F1C5" },
        { text: "APP", color: "#ffffff" },
      ],
      subtitle:
        "Experience institutional-grade security with the agility of decentralized finance. Secure, fast, and rewarding crypto platform for the next generation.",
      mobileSubtitle: "Secure, fast, and rewarding crypto platform.",
      ctaLabel: "GET THE APP",
      ctaUrl: "https://apps.apple.com/app/sicash",
      heroImage: "/heroImageSpay.png",
      gradientStart: "#090e1c",
      gradientEnd: "#0e2e2e",
      glowColor: "#0e2e2e",
    },
  },
  {
    id: "features",
    type: "features",
    name: "Features Section",
    file: "FeaturesSection.tsx",
    icon: "grid",
    visible: true,
    description: "Three feature cards: Transaction, Crypto, History.",
    data: {
      eyebrow: "A new era of digital banking",
      titleParts: [
        { text: "TAKE ", color: "#ffffff" },
        { text: "CONTROL", color: "#46F1C5" },
        { text: " OF ALL\nYOUR ", color: "#ffffff" },
        { text: "MONEY", color: "#46F1C5" },
      ],
      cards: [
        {
          title: "TRANSACTION",
          desc: "Manage all your finances with a single tap. Forget about banking hassles.",
          image: "/transactions.jpeg",
          bgStart: "#46F1C5",
          bgEnd: "#004132",
        },
        {
          title: "CRYPTO",
          desc: "Safely hold, effortlessly send, receive, and monitor your cryptocurrency holding.",
          image: "/crypto.jpeg",
          bgStart: "#46F1C5",
          bgEnd: "#004132",
        },
        {
          title: "HISTORY",
          desc: "Get a wide range of innovative financial tools for unlimited wealth-building opportunities.",
          image: "/notification.jpeg",
          bgStart: "#46F1C5",
          bgEnd: "#004132",
        },
      ],
    },
  },
  {
    id: "featureGrid",
    type: "featureGrid",
    name: "Feature Grid",
    file: "FeatureGrid.tsx",
    icon: "puzzle",
    visible: true,
    description: "Mosaic of supporting feature highlights.",
    data: {
      eyebrow: "BUILT FOR EVERY SCENARIO",
      title: "EVERYTHING YOU NEED",
      tiles: [
        { icon: "zap", label: "Instant transfers" },
        { icon: "lock", label: "Bank-grade security" },
        { icon: "globe", label: "Global coverage" },
        { icon: "card", label: "Virtual & physical cards" },
        { icon: "trend-up", label: "Earn while you hold" },
        { icon: "puzzle", label: "Open API" },
      ],
    },
  },
  {
    id: "payment",
    type: "payment",
    name: "Payment Section",
    file: "PaymentSection.tsx",
    icon: "card",
    visible: true,
    description: "Spay card with flippable front/back.",
    data: {
      eyebrow: "FIAT AND CRYPTO",
      titleParts: [
        { text: "CHOOSE ", color: "#46F1C5" },
        { text: "HOW TO PAY", color: "#ffffff" },
      ],
      subtitle: "Switch between fiat and crypto in a Second",
      cardFront: "/spayFront.png",
      cardBack: "/spayBack.png",
      flipOnHover: true,
    },
  },
  {
    id: "transfer",
    type: "transfer",
    name: "Transfer Section",
    file: "TransferSection.tsx",
    icon: "arrow-right",
    visible: true,
    description: "Crypto-anywhere card spend story with phone mockup.",
    data: {
      eyebrow: "TRANSFERS WITHOUT BARRIERS",
      titleParts: [
        { text: "SEND ", color: "#ffffff" },
        { text: "CRYPTO", color: "#46F1C5" },
        { text: " EASILY,\nANYWHERE, TO ANYONE", color: "#ffffff" },
      ],
      subtitle:
        "Spend your crypto anywhere a card is accepted — our card and app make it as easy as using a regular bank card.",
      mockupImage: "/paymentMobile.png",
    },
  },
  {
    id: "earn",
    type: "earn",
    name: "Earn Section",
    file: "EarnSection.tsx",
    icon: "trend-up",
    visible: true,
    description: "Staking pitch with APR gauge visual.",
    data: {
      eyebrow: "EARN WITH SPAY",
      titleParts: [
        { text: "MAKE ", color: "#ffffff" },
        { text: "CRYPTO", color: "#46F1C5" },
        { text: "\nWORK FOR YOU", color: "#ffffff" },
      ],
      subtitle:
        "Enjoy the crypto staking benefits provided by highly-secured cutting-edge encrypted solutions",
      apr: "3%",
      aprLabel: "APR up to",
    },
  },
  {
    id: "crypto",
    type: "crypto",
    name: "Crypto Section",
    file: "CryptoSection.tsx",
    icon: "branch",
    visible: true,
    description: "Manage and deposit crypto with phone mockup.",
    data: {
      eyebrow: "MANAGE CRYPTO",
      titleParts: [
        { text: "DEPOSIT AND INVEST WITH ", color: "#ffffff" },
        { text: "SPAY", color: "#46F1C5" },
      ],
      subtitle:
        "Purchase, spend, sell, and hold cryptocurrencies, all from the convenience of your device. Delve into the world of digital currencies effortlessly.",
      mockupImage: "/tabletMobile.png",
      tickers: ["BTC", "ETH", "USDT", "USDC", "SOL", "ADA", "DOGE"],
    },
  },
  {
    id: "linkedAccounts",
    type: "linkedAccounts",
    name: "Linked Accounts",
    file: "LinkedAccountsSection.tsx",
    icon: "link",
    visible: true,
    description: "Fanned crypto wallet cards with linked-success popup and globe.",
    data: {
      eyebrow: "LINKED ACCOUNTS",
      titleParts: [
        { text: "USE YOUR OTHER\n", color: "#ffffff" },
        { text: "CRYPTO ACCOUNTS", color: "#46F1C5" },
      ],
      subtitle:
        "Safely connect your crypto accounts to the app and manage them all from one secure access point.",
      centerCard: {
        name: "Alexander Reed",
        status: "Online",
        label: "All Accounts",
        balance: "$23,569",
      },
      wallets: [
        { name: "Alexander Reed", status: "Online", label: "CRYPTO WALLET 2", balance: "$ 8,724" },
        { name: "Alexander Reed", status: "Online", label: "CRYPTO WALLET 1", balance: "$ 9,824" },
        { name: "Alexander Reed", status: "Online", label: "CRYPTO WALLET 3", balance: "$ 3,960" },
        { name: "Alexander Reed", status: "Online", label: "CRYPTO WALLET 4", balance: "$ 5,532" },
      ],
      popup: {
        title: "SUCCESSFUL LINKED",
        body: "You have successfully connected your external crypto account. Thank you for using us.",
        ctaLabel: "CHECK IT OUT",
        ctaUrl: "https://apps.apple.com/app/sicash",
      },
    },
  },
  {
    id: "collaborations",
    type: "collaborations",
    name: "Collaborations",
    file: "CollaborationsSection.tsx",
    icon: "users",
    visible: true,
    description: "Partner & integration marquee.",
    data: {
      titleParts: [
        { text: "OUR ", color: "#ffffff" },
        { text: "COLLABORATIONS", color: "#46F1C5" },
      ],
      partners: [
        { name: "BitGo", icon: "₿" },
        { name: "FENIGE", icon: "◆" },
        { name: "INTERCOM", icon: "▦" },
        { name: "PLAID", icon: "▣" },
        { name: "QUICKO", icon: "◯" },
      ],
    },
  },
  {
    id: "joinUs",
    type: "joinUs",
    name: "Join Us",
    file: "JoinUsSection.tsx",
    icon: "sparkles",
    visible: true,
    description: "Final conversion section with team photo grid background.",
    data: {
      eyebrow: "JOIN US",
      titleParts: [
        { text: "TIME IS ", color: "#ffffff" },
        { text: "MONEY", color: "#46F1C5" },
      ],
      subtitle: "Be among the first to experience the next-gen money app.",
      ctaLabel: "GET THE APP",
      ctaUrl: "https://apps.apple.com/app/sicash",
      photos: [
        "/martha.png",
        "/inna.png",
        "/svitlana.png",
        "/mykhail.png",
        "/micheal.png",
        "/vladslav.png",
      ],
    },
  },
  {
    id: "footer",
    type: "footer",
    name: "Footer",
    file: "Footer.tsx",
    icon: "footer",
    visible: true,
    locked: true,
    description: "Site footer with links, app stores, and copyright.",
    data: {
      tagline: "THE MONEY APP",
      links: [
        { label: "About SPay", href: "/about" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Card Terms", href: "/card-terms" },
        { label: "E-Sign Consent", href: "/e-sign-consent" },
        { label: "Prohibited Activities", href: "/prohibited-activities" },
      ],
      copyright: "© 2026 SPay. All rights reserved.",
      appStoreUrl: "https://apps.apple.com/app/sicash",
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.sicash",
    },
  },
  {
    id: "bottomNav",
    type: "bottomNav",
    name: "Mobile Bottom Nav",
    file: "BottomNav.tsx",
    icon: "mobile",
    visible: true,
    description: "Mobile-only persistent action bar.",
    data: {
      items: [
        { label: "Home", icon: "dashboard", href: "/" },
        { label: "Card", icon: "card", href: "/payment" },
        { label: "Transfer", icon: "arrow-right", href: "/transfer" },
        { label: "Earn", icon: "trend-up", href: "/earn" },
      ],
    },
  },
  {
    id: "cookieConsent",
    type: "cookieConsent",
    name: "Cookie Consent",
    file: "CookieConsent.tsx",
    icon: "cookie",
    visible: true,
    description: "GDPR cookie acceptance banner.",
    data: {
      message:
        "We use cookies to enhance your experience. By continuing to visit this site, you accept our use of cookies.",
      acceptLabel: "Accept",
      declineLabel: "Decline",
      learnMoreUrl: "/privacy-policy",
    },
  },
];
