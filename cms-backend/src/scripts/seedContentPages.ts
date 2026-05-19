import { connectDb, disconnectDb } from '../config/db';
import { logger } from '../config/logger';
import { ContentPage, IBlock } from '../models/ContentPage';

type Seed = {
  slug: string;
  title: string;
  footerLabel?: string;
  effectiveDate?: string;
  lastUpdated?: string;
  blocks: IBlock[];
};

function H(level: 1 | 2 | 3, parts: Array<{ text: string; color?: string }>, idx: number, slug: string): IBlock {
  // Encode the level into the id so per-level counters don't collide across
  // levels (e.g. an H1 #1 and an H3 #1 on the same page).
  return { id: `${slug}-h${level}-${idx}`, type: 'heading', level, parts };
}
function P(text: string, idx: number, slug: string): IBlock {
  return { id: `${slug}-p-${idx}`, type: 'paragraph', text };
}
function L(items: string[], idx: number, slug: string, ordered = false): IBlock {
  return { id: `${slug}-l-${idx}`, type: 'list', ordered, items };
}

const WHITE = '#ffffff';
const GREEN = '#46F1C5';

const ABOUT: Seed = {
  slug: 'about',
  title: 'About SPay',
  footerLabel: 'About SPay',
  blocks: [
    H(1, [{ text: 'ABOUT', color: WHITE }, { text: ' SPAY', color: GREEN }], 1, 'about'),
    P(
      'SPAY is a global innovative platform for unified financial management of fiat and cryptocurrencies. Using cutting-edge technologies it seamlessly integrates with other financial service providers allowing users to easily manage all their cards and accounts in one user-friendly mobile app. It also offers fiat accounts, a crypto wallet and the world’s first card for both fiat and crypto with an easy switch. SPAY meets the highest standards of regulatory compliance and ensures advanced security measures to protect users’ funds.',
      1,
      'about',
    ),
    H(2, [{ text: 'MISSION', color: GREEN }], 2, 'about'),
    P(
      'Our mission is to make crypto spendable in everyday life. With the SPay card, your USDT, USDC, TRX, or ETH converts to fiat the moment you check out — tap at any store, swipe at a terminal, or pay online. No exchanges, no waiting, no friction between your crypto and the real world.',
      2,
      'about',
    ),
    H(2, [{ text: 'VISION', color: GREEN }], 3, 'about'),
    P(
      'A world where holding crypto doesn’t mean choosing between saving and spending. We’re building the bridge that lets your digital assets work like cash — accepted anywhere a card is, settled instantly, and always under your control.',
      3,
      'about',
    ),
  ],
};

const PRIVACY: Seed = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  footerLabel: 'Privacy Policy',
  effectiveDate: 'May 15, 2026',
  lastUpdated: 'May 15, 2026',
  blocks: [
    H(1, [{ text: 'PRIVACY', color: WHITE }, { text: ' POLICY', color: GREEN }], 1, 'privacy'),
    H(2, [{ text: '1. Overview', color: WHITE }], 2, 'privacy'),
    P(
      'This Privacy Policy describes how Novara Tech LLC ("SPay", "we", "us", or "our") collects, uses, shares, and protects information about you when you use the SPay platform, SPay Spend Card, website at [spay.finance](https://spay.finance), and related services (collectively, the "Services").',
      1,
      'privacy',
    ),
    P(
      'By using the Services, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Services.',
      2,
      'privacy',
    ),
    P(
      'We do not sell or rent your personal information. We share your information only as described in this Policy and as necessary to operate the Services and comply with applicable law.',
      3,
      'privacy',
    ),
    H(2, [{ text: '2. Information We Collect', color: WHITE }], 3, 'privacy'),
    H(3, [{ text: '2.1 Information You Provide', color: WHITE }], 4, 'privacy'),
    L(
      [
        'Account information: name, date of birth, nationality, email address, phone number, and residential address',
        'Government-issued identification such as passport, national ID, or driver’s license',
        'Financial information: cryptocurrency wallet addresses, linked wallet credentials, and bank or card details used for funding',
        'KYC/AML documentation including selfies, proof of address, and source-of-funds documentation',
        'Communications: support requests, emails, chat messages, and call recordings',
      ],
      1,
      'privacy',
    ),
    H(3, [{ text: '2.2 Information Collected Automatically', color: WHITE }], 5, 'privacy'),
    L(
      [
        'Transaction data: Card usage, merchant details, amounts, currency, date, and location',
        'Device and log data: IP address, device identifiers, browser type, operating system, and access times',
        'Blockchain data: public on-chain data associated with wallets you link to SPay, including balances and transaction history',
        'Cookies and similar technologies used for authentication, preferences, analytics, and security',
      ],
      2,
      'privacy',
    ),
    H(3, [{ text: '2.3 Information From Third Parties', color: WHITE }], 6, 'privacy'),
    L(
      [
        'Identity verification providers: KYC/AML results and risk scores',
        'Card Issuer and Networks: transaction authorization data from Third National (Issuer), Visa, Mastercard, and acquirers',
        'Blockchain analytics providers: wallet risk assessment and sanctions screening',
        'Fraud prevention services: risk signals from anti-fraud and cybersecurity partners',
        'Credit reference agencies and payment processors',
      ],
      3,
      'privacy',
    ),
    H(2, [{ text: '3. How We Use Your Information', color: WHITE }], 7, 'privacy'),
    P('We use your personal data for the following purposes:', 4, 'privacy'),
    L(
      [
        'To provide, operate, and maintain the Services, including issuing Cards and processing transactions',
        'To verify your identity and comply with KYC/AML, sanctions, counter-terrorism, and other legal obligations',
        'To monitor, detect, prevent, and investigate fraud, abuse, and security incidents',
        'To communicate with you about your account, Card activity, payment reminders, and service updates',
        'To respond to your inquiries and provide customer support',
        'To improve, personalize, and develop the Services',
        'To enforce the Card Terms, User Agreement, and other applicable terms',
        'To comply with legal process, regulatory requests, and court orders',
      ],
      4,
      'privacy',
    ),
    H(2, [{ text: '4. How We Share Your Information', color: WHITE }], 8, 'privacy'),
    P('We share information only with the following categories of recipients:', 5, 'privacy'),
    L(
      [
        '**Card Issuer:** Third National, the Issuer of your SPay Card, to enable Card issuance, transaction processing, and regulatory compliance',
        '**Card Networks:** Visa and Mastercard, to authorize and settle Card transactions',
        '**Service Providers:** Vendors who support our operations (cloud hosting, KYC/AML, analytics, customer support, fraud prevention) under confidentiality obligations',
        '**Law Enforcement and Regulators:** When required by applicable law, valid legal process, or to protect our rights, property, or safety',
        '**Affiliates and Successors:** In connection with a merger, acquisition, financing, or sale of all or part of our business',
        '**With Your Consent:** For purposes disclosed at the time of collection or as you otherwise authorize',
      ],
      5,
      'privacy',
    ),
    H(2, [{ text: '5. International Data Transfers', color: WHITE }], 9, 'privacy'),
    P(
      'SPay operates globally, and your information may be transferred to and processed in countries other than your country of residence, including the United States, Puerto Rico, and the jurisdictions where our service providers operate. We implement appropriate safeguards such as contractual clauses to protect your data during such transfers.',
      6,
      'privacy',
    ),
    H(2, [{ text: '6. Data Retention', color: WHITE }], 10, 'privacy'),
    P(
      'We retain your personal data for as long as necessary to provide the Services, comply with our legal, regulatory, and tax obligations, resolve disputes, and enforce our agreements. Certain categories of data (such as transaction records and KYC documentation) are retained for a minimum period required under applicable anti-money laundering and financial services laws, typically five (5) to seven (7) years after account closure.',
      7,
      'privacy',
    ),
    H(2, [{ text: '7. Your Rights and Choices', color: WHITE }], 11, 'privacy'),
    P('Subject to applicable law and verification of your identity, you may have the right to:', 8, 'privacy'),
    L(
      [
        '**Access** the personal data we hold about you',
        '**Correct** inaccurate or incomplete information',
        '**Delete** personal data, subject to our legal retention obligations',
        '**Restrict or object** to certain processing activities',
        '**Data portability** — receive your data in a structured, commonly used format',
        '**Withdraw consent** for processing based on consent, at any time',
        '**Opt-out** of marketing communications by following the unsubscribe instructions in any email or contacting us',
        '**Lodge a complaint** with your local data protection authority',
      ],
      6,
      'privacy',
    ),
    P(
      'To exercise these rights, contact us at [hamza@spay.finance](mailto:hamza@spay.finance). We will respond within the timeframes required by applicable law.',
      9,
      'privacy',
    ),
    H(2, [{ text: '8. Security', color: WHITE }], 12, 'privacy'),
    P(
      'We implement technical, organizational, and administrative safeguards designed to protect your personal data from unauthorized access, alteration, disclosure, and destruction, including encryption in transit and at rest, access controls, security audits, and employee training. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      10,
      'privacy',
    ),
    P(
      'You are responsible for maintaining the security of your account credentials, including your password and any two-factor authentication methods. Never share your credentials with anyone. Report suspicious communications to [hamza@spay.finance](mailto:hamza@spay.finance).',
      11,
      'privacy',
    ),
    H(2, [{ text: '9. Children’s Privacy', color: WHITE }], 13, 'privacy'),
    P(
      'The Services are not directed to individuals under the age of 18 (or the legal age of majority in your jurisdiction, whichever is higher). We do not knowingly collect personal data from minors. If we learn we have collected personal data from a minor, we will delete it promptly.',
      12,
      'privacy',
    ),
    H(2, [{ text: '10. Cookies and Tracking', color: WHITE }], 14, 'privacy'),
    P(
      'We use cookies, local storage, and similar technologies to operate the Services, remember your preferences, analyze usage, and enhance security. You can control cookies through your browser settings. Disabling essential cookies may affect the functionality of the Services. For more details, see our [Cookie Policy](/cookie-policy).',
      13,
      'privacy',
    ),
    H(2, [{ text: '11. Third-Party Links and Services', color: WHITE }], 15, 'privacy'),
    P(
      'The Services may contain links to third-party websites, applications, and services, including blockchain networks and third-party wallets. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before using them.',
      14,
      'privacy',
    ),
    H(2, [{ text: '12. Blockchain Transparency', color: WHITE }], 16, 'privacy'),
    P(
      'Transactions recorded on public blockchains are inherently transparent, immutable, and beyond our control. Wallet addresses and on-chain activity you associate with SPay may be publicly visible. We cannot delete or alter information recorded on a blockchain.',
      15,
      'privacy',
    ),
    H(2, [{ text: '13. Changes to This Privacy Policy', color: WHITE }], 17, 'privacy'),
    P(
      'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will post the updated policy on this page and update the "Last updated" date above. Material changes will be communicated via email or in-app notice. Your continued use of the Services after the effective date constitutes acceptance of the updated policy.',
      16,
      'privacy',
    ),
    H(2, [{ text: '14. Contact Us', color: WHITE }], 18, 'privacy'),
    P(
      'If you have questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us at:',
      17,
      'privacy',
    ),
    P(
      '**Novara Tech LLC (SPay)**\nEmail: [hamza@spay.finance](mailto:hamza@spay.finance)\nPhone: +971 55 947 6972',
      18,
      'privacy',
    ),
  ],
};

const CARD_TERMS: Seed = {
  slug: 'card-terms',
  title: 'SPay Spend Card Terms',
  footerLabel: 'Card Terms',
  effectiveDate: 'May 15, 2026',
  lastUpdated: 'May 15, 2026',
  blocks: [
    H(1, [{ text: 'SPAY SPEND', color: WHITE }, { text: ' CARD TERMS', color: GREEN }], 1, 'ct'),
    P(
      'These SPay Spend Card Terms (the "Card Terms") are a binding agreement between you ("you" or "your") and the Issuer ("we", "us", or "our") that governs your use of the SPay Spend Cards, including the process for obtaining and managing SPay Spend Cards, access to which is provided to you by Novara Tech LLC ("SPay").',
      1,
      'ct',
    ),
    H(3, [{ text: 'Important Disclosures', color: WHITE }], 2, 'ct'),
    P(
      'PLEASE REVIEW THE ARBITRATION CLAUSE AND NOTICES SET FORTH BELOW IN SECTION 16. BY USING THE CARD, YOU ARE AGREEING TO THE ARBITRATION CLAUSE AND NOTICES SET FORTH IN THAT SECTION. THE ARBITRATION CLAUSE WILL HAVE A SUBSTANTIAL EFFECT ON YOUR RIGHTS IN THE EVENT OF A DISPUTE, INCLUDING YOUR RIGHT TO BRING OR PARTICIPATE IN A CLASS PROCEEDING.',
      2,
      'ct',
    ),
    P(
      'Rates, fees, and other important information about your SPay Spend Card ("SPay Card" or "Card") are set forth in these Important Disclosures.',
      3,
      'ct',
    ),
    P('Effective as of May 15, 2026', 4, 'ct'),
    P('Interest Rates and Interest Charges 0%', 5, 'ct'),
    P('Annual Percentage Rate (APR) for Purchases 0%', 6, 'ct'),
    P(
      'Your SPay Spend Card is currently Zero 0% interest on all purchases. Issuer and SPay reserve the right to implement interest in the future, for new purchases. SPay will disclose any changes to this agreement prior to the introduction of interest and other charges associated with your SPay Card.',
      7,
      'ct',
    ),
    H(3, [{ text: 'Fees', color: WHITE }], 3, 'ct'),
    H(3, [{ text: 'Foreign Purchases', color: WHITE }], 4, 'ct'),
    P('- Foreign Exchange Fee (non USD): up to 3%', 8, 'ct'),
    P('- Cross Border Fee: up to 3%', 9, 'ct'),
    H(3, [{ text: 'Penalty Fees', color: WHITE }], 5, 'ct'),
    P('- Late payment: Up to $40', 10, 'ct'),
    P('- Returned payment: Up to $29', 11, 'ct'),
    P(
      'WHEN YOU APPLY FOR A CARD ACCOUNT, ACTIVATE A CARD, OR OTHERWISE PARTICIPATE IN THE PROGRAM IN ANY WAY, YOU REPRESENT THAT YOU HAVE READ, UNDERSTAND, AND AGREE TO THESE CARD TERMS.',
      12,
      'ct',
    ),
    H(2, [{ text: '1. Accepting this Agreement & Eligibility', color: WHITE }], 6, 'ct'),
    P(
      'These Card Terms become effective and legally binding when you activate or create your Card by following the instructions on the SPay platform. You and we agree to comply with, and be bound by, this entire agreement. You should retain and carefully review these Card Terms. By creating a Card, you agree to the Arbitration Clause below as it pertains to these Card Terms, even if you do not use the Account or the Card.',
      13,
      'ct',
    ),
    P('By using a Card you represent and warrant in your individual capacity that:', 14, 'ct'),
    L(
      [
        'You are not a person who is blocked or sanctioned by the United States Government, including those identified by the United States Office of Foreign Asset Controls (OFAC).',
        'You will use the Services exclusively for purposes permitted by these Card Terms.',
        'All information you provide to us, either directly or through SPay, is and will be true, correct, and complete.',
        'You will use the SPay Card for personal, family, or household use.',
        'You will only use the SPay Card in compliance with applicable law',
        'You attest that you are not a United States citizen, and that you are signing up for a card that is intended for those outside of the United States.',
        'You attest that you were not solicited for this Card.',
      ],
      1,
      'ct',
    ),
    H(2, [{ text: '2. Issuer Terms', color: WHITE }], 7, 'ct'),
    P(
      'The Issuer is identified on the back of the SPay Card issued to you and is responsible for funding your payments for goods and services you purchase at a merchant through your SPay Card and based on information provided by Partner. Please note that the Issuer may require you to accept additional terms in addition to the agreements you have with SPay, and your use of the SPay Cards will then also be subject to such additional terms.',
      15,
      'ct',
    ),
    H(2, [{ text: '3. Collateral', color: WHITE }], 8, 'ct'),
    P(
      'This Account is a secured Account. Either your primary Linked Wallet or any Additional Wallets may provide the collateral that will secure the Charges made by you on any Card (the "Collateral"). The Collateral must be held in a wallet on a Supported Blockchain. By entering into these Card Terms, you are furnishing and granting us a security interest in the Collateral, as well as any additions to, substitutions or renewals of the Collateral. No portion of the Collateral may be used by you to secure other loans.',
      16,
      'ct',
    ),
    H(2, [{ text: '4. Spending Limits', color: WHITE }], 9, 'ct'),
    P(
      'Your spending limit is generally set by SPay pursuant to the terms of the SPay Terms and the amount of Collateral. Issuer may additionally set spending limits on each SPay Card or an aggregate spending limit across all SPay Cards, at its sole discretion. SPay Account Spending limits are dynamic and may be modified at any time with or without notice to you, including temporary increases or decreases or reducing spending limits to $0. Any authorized Charge or fee on a SPay Card may reduce your spending limit by a corresponding amount.',
      17,
      'ct',
    ),
    H(2, [{ text: '5. Purchases & Restrictions', color: WHITE }], 10, 'ct'),
    P(
      'SPay and Issuer reserve the right to block and terminate transactions and suspend access to your Account, unless prohibited by applicable law, at any time and for any reason, including if we believe that you are using the Card or your Account for non-consumer purposes.',
      18,
      'ct',
    ),
    P(
      'You acknowledge and agree that you have read and understood the [Prohibited Activities](/prohibited-activities) and that you will not engage in any such activities when using the Services or the SPay Card.',
      19,
      'ct',
    ),
    H(2, [{ text: '6. Payments', color: WHITE }], 11, 'ct'),
    H(3, [{ text: '6.1 Promise to Pay', color: WHITE }], 7, 'ct'),
    P(
      'While you will generally repay SPay for amounts transacted with your Card, you also promise to pay Issuer or its assignees for all amounts charged to the Account not repaid to Issuer by Partner, including all purchases, interest, and charges charged to your Account.',
      20,
      'ct',
    ),
    H(3, [{ text: '6.2 Periodic Statements', color: WHITE }], 8, 'ct'),
    P(
      'You are responsible for payment in full of all Charges and Fees. Your SPay Account may furnish to you Periodic Statements identifying Charges, Fees, refunds, the amount of your Collateral, any other Card transactions, or other amounts owed or credited to your SPay Account.',
      21,
      'ct',
    ),
    H(2, [{ text: '7. Fees', color: WHITE }], 12, 'ct'),
    L(
      [
        'The Fees applicable to your Account are described above. You are responsible for Fees in addition to Charges.',
        'Returned Payment fees become payable by you each time a payment on your Account is returned or reversed for any reason.',
        'Foreign Currency Transactions are converted at the applicable network rate, which may differ from the rate on the transaction date.',
      ],
      2,
      'ct',
    ),
    H(2, [{ text: '8. Managing Your SPay Cards', color: WHITE }], 13, 'ct'),
    P(
      'We or SPay may decide not to grant requests for SPay Cards or limit the number of physical or virtual SPay Cards provided to you. You are responsible for securing SPay Cards, account numbers, and SPay Card security features. You will promptly notify us and take appropriate measures to prevent unauthorized transactions when a SPay Card is lost, stolen, breached, or needs to be replaced.',
      22,
      'ct',
    ),
    H(2, [{ text: '9. Chargebacks', color: WHITE }], 14, 'ct'),
    P(
      'You are responsible for reviewing your Periodic Statements promptly and identifying any Charges that you believe are unauthorized or that you dispute. You must report any disputed Charge or error no more than 60 days after the disputed Charge is posted on your Periodic Statement.',
      23,
      'ct',
    ),
    H(2, [{ text: '10. Termination', color: WHITE }], 15, 'ct'),
    P(
      'Subject to applicable law, we may suspend, revoke or cancel your Account privileges, your right to use the Card or deny any transaction, in our sole discretion at any time, with or without cause and with or without giving you notice.',
      24,
      'ct',
    ),
    H(2, [{ text: '11. Change of Terms', color: WHITE }], 16, 'ct'),
    P(
      'Subject to applicable law, we may at any time change, add to or delete terms and conditions of these Card Terms, including interest rates and this Change of Terms provision.',
      25,
      'ct',
    ),
    H(2, [{ text: '12. Governing Law', color: WHITE }], 17, 'ct'),
    P(
      'These Card Terms will be interpreted in accordance with the laws of Puerto Rico without regard to conflict-of-law provisions.',
      26,
      'ct',
    ),
    H(2, [{ text: '13. Contact', color: WHITE }], 18, 'ct'),
    P(
      'Questions about these Card Terms? Email [hamza@spay.finance](mailto:hamza@spay.finance) or call +971 55 947 6972.',
      27,
      'ct',
    ),
  ],
};

const ESIGN: Seed = {
  slug: 'e-sign-consent',
  title: 'E-Sign & Electronic Communications Notice',
  footerLabel: 'E-Sign Consent',
  lastUpdated: 'November 24, 2025',
  blocks: [
    H(
      1,
      [
        { text: 'E-SIGN & ELECTRONIC', color: WHITE },
        { text: ' COMMUNICATIONS NOTICE', color: GREEN },
      ],
      1,
      'esign',
    ),
    H(3, [{ text: 'Your Consent to Electronic Delivery', color: WHITE }], 1, 'esign'),
    P('("Consent Statement")', 1, 'esign'),
    P(
      'You are applying for an SPay Card. If you consent to this Consent Statement for this Program, it applies even if you do not obtain (or are not offered) an SPay Card.',
      2,
      'esign',
    ),
    P(
      'Your affirmative consent to this E-sign & Electronic Communications Notice ("Consent") permits us to provide you such Communications electronically, enables you to sign and authorize Communications electronically through the use of the Dashboard or APIs provided by SPay (the "Dashboard", "Platform" or "Service"), and allows SPay and its partners to collect such e-signings. If you do not consent to electronic delivery of Communications, you will not be able to use the Service.',
      3,
      'esign',
    ),
    P(
      'You have the right to receive legal disclosures, notices, and communications (together, the "Covered Items") in paper form by mail. We may instead provide these Covered Items to you electronically if you give us your Consent to do so and satisfy the System Requirements below.',
      4,
      'esign',
    ),
    H(3, [{ text: 'Duration of Consent', color: WHITE }], 2, 'esign'),
    P(
      'Your Consent will remain effective until: (1) you or we have terminated the Program or your Card; (2) you opt-out of electronic communications. If you terminate your Card, your Consent will still continue with respect to the pre-termination rights of SPay.',
      5,
      'esign',
    ),
    H(3, [{ text: 'Methods of Providing Covered Items', color: WHITE }], 3, 'esign'),
    P(
      'In this document, "provide" means to deliver, make available, send, notify or similar term. We may provide the Covered Items electronically through files, including those in PDF format, downloaded from our website. It is your responsibility to review the Covered Items promptly, so you can take appropriate action.',
      6,
      'esign',
    ),
    H(3, [{ text: 'Access to Paper Copies', color: WHITE }], 4, 'esign'),
    P(
      'You may make copies of the Covered Items by using the "print" or "save" functionality of the application in which you are viewing the Covered Items. We retain copies of the Covered Items for the time periods required by law and will provide you with copies upon request within those time periods.',
      7,
      'esign',
    ),
    P(
      'You may request a paper copy at no cost of any Covered Item by emailing us at [hamza@spay.finance](mailto:hamza@spay.finance).',
      8,
      'esign',
    ),
    H(3, [{ text: 'Our Right to Send Paper', color: WHITE }], 5, 'esign'),
    P(
      'We reserve the right to provide the Covered Items in paper form at all times at our discretion even if you have given us Consent to provide it electronically. For example, but without limitation, we may do this if we have a system outage or if we suspect fraud.',
      9,
      'esign',
    ),
    H(3, [{ text: 'Hardware and Software Requirements', color: WHITE }], 6, 'esign'),
    P('To access and retain the Covered Items, you must have a computing or communications device with:', 10, 'esign'),
    L(
      [
        'working Internet access',
        'a Web browser that supports 128-bit encryption (latest version of Chrome, Firefox, Edge, or Safari)',
        '16 MB of available memory (32 MB of RAM recommended)',
        'a program that can view, save and print PDF files',
      ],
      1,
      'esign',
    ),
    H(3, [{ text: 'Withdrawing Consent', color: WHITE }], 7, 'esign'),
    P(
      'You are free to withdraw Your Consent at any time and at no charge to you. If you wish to withdraw Your Consent, you may do this by emailing us at [hamza@spay.finance](mailto:hamza@spay.finance).',
      11,
      'esign',
    ),
    H(3, [{ text: 'Acknowledging Ability to Access', color: WHITE }], 8, 'esign'),
    P(
      'By confirming that you have read and agreed to these terms, you are confirming that (1) you have access to a computer system that meets the requirements set forth above; (2) you agree to receive Covered Items electronically; and (3) you are able to access and print or store information presented to you.',
      12,
      'esign',
    ),
  ],
};

const PROHIBITED: Seed = {
  slug: 'prohibited-activities',
  title: 'Prohibited Activities',
  footerLabel: 'Prohibited Activities',
  effectiveDate: 'May 15, 2026',
  lastUpdated: 'May 15, 2026',
  blocks: [
    H(
      1,
      [{ text: 'PROHIBITED', color: WHITE }, { text: ' ACTIVITIES', color: GREEN }],
      1,
      'pa',
    ),
    P(
      'By using your SPay Card, you agree not to engage in any of the activities listed below. This list is incorporated by reference into the [SPay Spend Card Terms](/card-terms). Violation of this policy may result in suspension or termination of your Card privileges, and may expose you to civil or criminal liability under applicable law.',
      1,
      'pa',
    ),
    H(2, [{ text: '1. Illegal and Regulated Activities', color: WHITE }], 2, 'pa'),
    L(
      [
        'Illegal drugs or controlled substances, including narcotics, synthetic drugs, and drug paraphernalia',
        'Cannabis and marijuana-related products, including dispensaries and cultivation suppliers, regardless of local legality',
        'Firearms, ammunition, and weapons, including gun parts, accessories, explosives, and related items',
        'Human trafficking, forced labor, or any activity that exploits individuals',
        'Child sexual abuse material or any content sexually exploiting minors',
        'Counterfeit goods, including forged currency, fake identification documents, or pirated intellectual property',
        'Stolen property or goods acquired through theft or unauthorized access',
      ],
      1,
      'pa',
    ),
    H(2, [{ text: '2. Financial Crimes and Fraud', color: WHITE }], 3, 'pa'),
    L(
      [
        'Money laundering or transactions intended to conceal proceeds of illegal activity',
        'Terrorism financing or transactions involving sanctioned individuals or entities',
        'Fraudulent or deceptive practices, including phishing, identity theft, and account takeover schemes',
        'Unauthorized transactions using stolen payment credentials or accounts',
        'Pyramid schemes, Ponzi schemes, or multi-level marketing structures where returns depend primarily on recruitment',
        'Unregistered securities or investment contracts that have not complied with applicable securities laws',
        'Shell company transactions structured to evade reporting requirements',
      ],
      2,
      'pa',
    ),
    H(2, [{ text: '3. Regulated Industries', color: WHITE }], 4, 'pa'),
    L(
      [
        'Gambling, including online casinos, sports betting, lottery tickets, and race track wagers',
        'Adult entertainment, including pornography, escort services, and adult dating services',
        'Tobacco products, including cigarettes, e-cigarettes, vaping products, and smokeless tobacco',
        'Prescription pharmaceuticals from unlicensed or non-compliant sources',
        'Unregistered money services, including unlicensed money transmission, remittance, or currency exchange',
        'Timeshares and high-pressure sales schemes for vacation properties',
      ],
      3,
      'pa',
    ),
    H(2, [{ text: '4. Cryptocurrency and Digital Asset Restrictions', color: WHITE }], 5, 'pa'),
    L(
      [
        'Purchase of cryptocurrency or other digital or virtual currencies with your SPay Card',
        'Peer-to-peer crypto exchanges or unlicensed digital asset platforms',
        'Initial coin offerings (ICOs) or token sales not registered with applicable regulators',
        'Transactions involving sanctioned addresses or wallets on blockchain networks',
        'Privacy coins or mixers designed to obscure transaction origin',
        'NFTs that infringe intellectual property or depict illegal content',
      ],
      4,
      'pa',
    ),
    H(2, [{ text: '5. Cash-Like Transactions', color: WHITE }], 6, 'pa'),
    L(
      [
        'Travelers checks, money orders, and wire transfers',
        'Foreign currency purchases outside of ordinary travel and commerce',
        'Person-to-person money transfers and account-funding transactions that convert card balance into cash equivalents',
        'Third-party bill payment services not made directly with the merchant',
        'Cash advances and balance transfers are not available under the Card Terms',
      ],
      5,
      'pa',
    ),
    H(2, [{ text: '6. Sanctions and Restricted Jurisdictions', color: WHITE }], 7, 'pa'),
    L(
      [
        'Transactions with individuals or entities identified on the U.S. Office of Foreign Assets Control (OFAC) Specially Designated Nationals list',
        'Transactions in or benefiting comprehensively sanctioned jurisdictions, including Cuba, Iran, North Korea, Syria, and the Crimea, Donetsk, and Luhansk regions',
        'Use of the Card by U.S. citizens or residents (this Card is intended for users outside the United States only)',
      ],
      6,
      'pa',
    ),
    H(2, [{ text: '7. Other Restricted Uses', color: WHITE }], 8, 'pa'),
    L(
      [
        'Any activity that violates applicable law in the cardholder’s jurisdiction, the merchant’s jurisdiction, or the Issuer’s jurisdiction',
        'Business or commercial use (this Card is for personal, family, or household use only)',
        'Expenses not incurred by the cardholder personally',
        'Activities that violate Card Network rules (Visa, Mastercard) or Issuer policies',
        'High-risk merchant categories as determined by the Issuer or Card Network',
      ],
      7,
      'pa',
    ),
    H(2, [{ text: 'Notice', color: WHITE }], 9, 'pa'),
    P(
      'This list is not exhaustive. SPay and the Issuer reserve the right to deny, block, or reverse any transaction for any reason, including suspected fraud, non-compliance with applicable law, or indication of increased risk. If you have questions about a specific merchant or transaction type, please contact us at [hamza@spay.finance](mailto:hamza@spay.finance) before completing the transaction.',
      2,
      'pa',
    ),
  ],
};

const SEEDS: Seed[] = [ABOUT, PRIVACY, CARD_TERMS, ESIGN, PROHIBITED];

async function main() {
  await connectDb();
  let created = 0;
  let skipped = 0;

  for (const seed of SEEDS) {
    const existing = await ContentPage.findOne({ workspaceId: 'default', slug: seed.slug });
    if (existing) {
      logger.info({ slug: seed.slug }, 'Content page already exists; skipping.');
      skipped += 1;
      continue;
    }
    await ContentPage.create({
      workspaceId: 'default',
      slug: seed.slug,
      title: seed.title,
      footerLabel: seed.footerLabel ?? null,
      showInFooter: true,
      status: 'published',
      isDirty: false,
      effectiveDate: seed.effectiveDate ?? null,
      lastUpdated: seed.lastUpdated ?? null,
      draftBlocks: seed.blocks,
      publishedBlocks: seed.blocks,
      version: 1,
      lastPublishedAt: new Date(),
    });
    logger.info({ slug: seed.slug, blocks: seed.blocks.length }, 'Seeded content page.');
    created += 1;
  }

  logger.info({ created, skipped, total: SEEDS.length }, 'Content page seed complete.');
  await disconnectDb();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
