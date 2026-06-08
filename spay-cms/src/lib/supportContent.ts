/**
 * Support ("Get in touch") page content — CMS side. Mirrors
 * spay-website/src/lib/supportContent.ts. The card layout + icons stay in code;
 * this only drives the text, emails, phone, and hours. KEEP IN SYNC.
 */
import type { SectionDef } from './homeContent';

export const SUPPORT_CONTENT_DEFAULTS: Record<string, any> = {
  header: {
    eyebrow: "We're here to help",
    white: 'GET IN ',
    accent: 'TOUCH',
    intro:
      "Have a question about your SPay account, a transaction, or anything else? Our team is ready to assist. Reach out through any of the channels below and we'll get back to you within one business day.",
  },
  channels: {
    cards: [
      { label: 'Email Support', value: 'support@spay.finance', desc: 'For account, card, and transaction issues. Replies within 24 hours on business days.' },
      { label: 'Phone Support', value: '+971 55 947 6972', desc: 'Speak to a live agent for urgent card or fraud issues. Available during support hours.' },
      { label: 'Support Hours', value: 'Mon – Fri', desc: '9:00 AM – 6:00 PM GST\nClosed on UAE public holidays' },
    ],
  },
  general: {
    eyebrow: 'Drop us a line',
    white: 'General ',
    accent: 'inquiries',
    body: 'Press, partnerships, careers, or feedback — we read every message. For account-specific questions, please use the channels above so we can verify your identity faster.',
    email: 'it@spay.finance',
  },
};

export const SUPPORT_CONTENT_SCHEMA: SectionDef[] = [
  {
    key: 'header', label: 'Header',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'white', label: 'Heading' },
      { type: 'text', key: 'accent', label: 'Highlight' },
      { type: 'textarea', key: 'intro', label: 'Intro' },
    ],
  },
  {
    key: 'channels', label: 'Contact cards',
    fields: [
      {
        type: 'objectList', key: 'cards', label: 'Cards (Email · Phone · Hours)', itemLabel: 'Card',
        itemFields: [
          { type: 'text', key: 'label', label: 'Label' },
          { type: 'text', key: 'value', label: 'Value' },
          { type: 'textarea', key: 'desc', label: 'Description' },
        ],
      },
    ],
  },
  {
    key: 'general', label: 'General inquiries',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'white', label: 'Heading' },
      { type: 'text', key: 'accent', label: 'Highlight' },
      { type: 'textarea', key: 'body', label: 'Body' },
      { type: 'text', key: 'email', label: 'Email' },
    ],
  },
];

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

export const resolveSupportContent = (raw: any) => mergeValue(SUPPORT_CONTENT_DEFAULTS, raw ?? {});
