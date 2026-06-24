'use client';

import React from 'react';
import { Globe, Sparkles, Facebook, Save, RotateCcw, Loader2, Search, Filter, Tag, X, Plus, Code2 } from 'lucide-react';
// (Filter still used by the "Noindex filtered URLs" toggle icon)
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import { useSetting, useUpdateSetting } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';

type SiteSEO = {
  siteName: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  searchConsoleVerification: string;
  organizationName: string;
  sameAs: string;
};

const DEFAULT: SiteSEO = {
  siteName: 'Spay',
  titleTemplate: '{title} | Spay',
  defaultDescription: 'Spay is the money app where fiat and crypto live side by side.',
  defaultOgImage: '',
  twitterHandle: '@spay',
  searchConsoleVerification: '',
  organizationName: 'Spay, Inc.',
  sameAs: '',
};

type CrawlSettings = {
  noindexSearch: boolean;
  noindexTags: boolean;
  noindexFiltered: boolean;
};

const DEFAULT_CRAWL: CrawlSettings = {
  noindexSearch: true,
  noindexTags: true,
  noindexFiltered: true,
};

/** Site-wide default code injection — applied to EVERY page, on top of any
 *  per-page snippets set in the page/post editor. */
type GlobalCodeInjection = {
  header: string;
  body: string;
  footer: string;
};

const DEFAULT_CODE: GlobalCodeInjection = {
  header: '',
  body: '',
  footer: '',
};

export default function SEOSettingsPage() {
  const { data, isLoading } = useSetting<SiteSEO>('seo');
  const { data: crawlData } = useSetting<CrawlSettings>('crawl');
  const { data: codeData } = useSetting<GlobalCodeInjection>('codeInjection');
  const update = useUpdateSetting();
  const { toast } = useToast();
  const [draft, setDraft] = React.useState<SiteSEO>(DEFAULT);
  const [crawlDraft, setCrawlDraft] = React.useState<CrawlSettings>(DEFAULT_CRAWL);
  const [codeDraft, setCodeDraft] = React.useState<GlobalCodeInjection>(DEFAULT_CODE);
  const [dirty, setDirty] = React.useState(false);
  const [crawlDirty, setCrawlDirty] = React.useState(false);
  const [codeDirty, setCodeDirty] = React.useState(false);

  // Organization state is owned by OrganizationCard; it exposes its current
  // value via a ref + signals dirty via a callback. This keeps that editor
  // self-contained while still using the page-level Save button.
  const [orgDirty, setOrgDirty] = React.useState(false);
  const orgRef = React.useRef<Organization | null>(null);

  React.useEffect(() => {
    if (data) {
      setDraft({ ...DEFAULT, ...data });
      setDirty(false);
    }
  }, [data]);

  React.useEffect(() => {
    if (crawlData) {
      setCrawlDraft({ ...DEFAULT_CRAWL, ...crawlData });
      setCrawlDirty(false);
    }
  }, [crawlData]);

  React.useEffect(() => {
    if (codeData) {
      setCodeDraft({ ...DEFAULT_CODE, ...codeData });
      setCodeDirty(false);
    }
  }, [codeData]);

  const set = (k: keyof SiteSEO, v: any) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const setCrawl = (k: keyof CrawlSettings, v: any) => {
    setCrawlDraft((d) => ({ ...d, [k]: v }));
    setCrawlDirty(true);
  };

  const setCode = (k: keyof GlobalCodeInjection, v: string) => {
    setCodeDraft((d) => ({ ...d, [k]: v }));
    setCodeDirty(true);
  };

  const save = async () => {
    try {
      const tasks: Promise<unknown>[] = [];
      if (dirty)      tasks.push(update.mutateAsync({ key: 'seo',   value: draft }));
      if (crawlDirty) tasks.push(update.mutateAsync({ key: 'crawl', value: crawlDraft }));
      if (codeDirty)  tasks.push(update.mutateAsync({ key: 'codeInjection', value: codeDraft }));
      if (orgDirty && orgRef.current) {
        tasks.push(update.mutateAsync({ key: 'organization', value: orgRef.current }));
      }
      if (tasks.length === 0) return;
      await Promise.all(tasks);
      setDirty(false);
      setCrawlDirty(false);
      setCodeDirty(false);
      setOrgDirty(false);
      toast({ title: 'SEO settings saved', variant: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  const anyDirty = dirty || crawlDirty || codeDirty || orgDirty;

  return (
    <PageContainer>
      <PageHeader
        title="SEO Settings"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft({ ...DEFAULT, ...(data ?? {}) });
                setCrawlDraft({ ...DEFAULT_CRAWL, ...(crawlData ?? {}) });
                setCodeDraft({ ...DEFAULT_CODE, ...(codeData ?? {}) });
                setDirty(false);
                setCrawlDirty(false);
                setCodeDirty(false);
              }}
              disabled={!anyDirty}
            >
              <RotateCcw />Reset
            </Button>
            <Button size="sm" onClick={save} disabled={!anyDirty || update.isPending}>
              {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-spay-lg" />
      ) : (
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general"><Globe className="size-3.5" />General</TabsTrigger>
            <TabsTrigger value="social"><Facebook className="size-3.5" />Social</TabsTrigger>
            <TabsTrigger value="schema"><Sparkles className="size-3.5" />Schema</TabsTrigger>
            <TabsTrigger value="code"><Code2 className="size-3.5" />Code</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Site name"><Input value={draft.siteName} onChange={(e) => set('siteName', e.target.value)} /></Field>
                <Field label="Default title template" hint="Use {title} as a placeholder."><Input className="font-mono" value={draft.titleTemplate} onChange={(e) => set('titleTemplate', e.target.value)} /></Field>
                <Field label="Default meta description"><Textarea rows={3} value={draft.defaultDescription} onChange={(e) => set('defaultDescription', e.target.value)} /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crawler controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CrawlToggle
                  icon={<Search className="size-4 text-cyan-300" />}
                  title="Noindex search pages"
                  description={
                    <>URLs starting with <code className="font-mono">/search</code> or any URL with the <code className="font-mono">?q=</code> query param.</>
                  }
                  checked={crawlDraft.noindexSearch}
                  onChange={(v) => setCrawl('noindexSearch', v)}
                />
                <CrawlToggle
                  icon={<Tag className="size-4 text-cyan-300" />}
                  title="Noindex tag pages"
                  description={
                    <>Anything under <code className="font-mono">/tag/*</code> or <code className="font-mono">/blog/tag/*</code>. Tag archives are usually thin content.</>
                  }
                  checked={crawlDraft.noindexTags}
                  onChange={(v) => setCrawl('noindexTags', v)}
                />
                <CrawlToggle
                  icon={<Filter className="size-4 text-cyan-300" />}
                  title="Noindex filtered URLs"
                  description={
                    <>Any URL with a query string (<code className="font-mono">?utm_*</code>, <code className="font-mono">?page=2</code>, <code className="font-mono">?category=</code>, etc.).</>
                  }
                  checked={crawlDraft.noindexFiltered}
                  onChange={(v) => setCrawl('noindexFiltered', v)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Open Graph &amp; Twitter</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Default OG image URL"><Input className="font-mono" value={draft.defaultOgImage} onChange={(e) => set('defaultOgImage', e.target.value)} placeholder="https://spay.finance/og-default.webp" /></Field>
                <Field label="Twitter handle"><Input className="font-mono" value={draft.twitterHandle} onChange={(e) => set('twitterHandle', e.target.value)} /></Field>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <OrganizationCard onDirtyChange={setOrgDirty} pendingRef={orgRef} />
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site-wide code injection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-[12px] text-fg-3 leading-relaxed">
                  Applied to <span className="text-fg-1 font-medium">every page</span> of the
                  site, in addition to any per-page snippets set in the page/post editor.
                  Use for global tags — analytics, pixels, chat widgets, verification.
                  Rendered verbatim and not sanitized, so only add code you trust.
                </p>
                <GlobalCodeField
                  label="Header"
                  hint="Injected into <head> on every page (analytics, pixels, verification meta)."
                  value={codeDraft.header}
                  onChange={(v) => setCode('header', v)}
                  placeholder={'<!-- e.g. <script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script> -->'}
                />
                <GlobalCodeField
                  label="Body"
                  hint="Injected at the top of <body> on every page (widgets, banners)."
                  value={codeDraft.body}
                  onChange={(v) => setCode('body', v)}
                  placeholder={'<!-- e.g. GTM <noscript> fallback -->'}
                />
                <GlobalCodeField
                  label="Footer"
                  hint="Injected at the end of <body> on every page (deferred scripts, chat)."
                  value={codeDraft.footer}
                  onChange={(v) => setCode('footer', v)}
                  placeholder={'<!-- e.g. live-chat or deferred analytics -->'}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 md:items-start">
      <div className="md:pt-2">
        <Label>{label}</Label>
      </div>
      <div>{children}</div>
    </div>
  );
}

function GlobalCodeField({
  label, hint, value, onChange, placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <Code2 className="size-3.5 text-fg-4" />
          {label}
        </Label>
        {value.trim() && (
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300">set</span>
        )}
      </div>
      <div className="rounded-spay-md border border-line bg-surface-deepest overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={6}
          placeholder={placeholder}
          className="w-full p-3 bg-transparent font-mono text-[11px] text-fg-1 placeholder:text-fg-4 outline-none resize-y leading-relaxed"
        />
      </div>
      <p className="text-[10px] text-fg-4 leading-relaxed">{hint}</p>
    </div>
  );
}

function CrawlToggle({
  icon, title, checked, onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 rounded-spay-md border border-line bg-surface/40 cursor-pointer hover:bg-surface transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 size-7 rounded-spay-sm border border-cyan-300/25 bg-cyan-300/[0.06] flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-1">{title}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Organization schema editor
 * ──────────────────────────────────────────────────────────────── */

export type Organization = {
  name: string;
  legalName: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: { telephone: string; email: string; contactType: string };
};

const DEFAULT_ORG: Organization = {
  name: 'Spay',
  legalName: 'Spay, Inc.',
  url: 'https://spay.finance',
  logo: '',
  description: '',
  sameAs: [],
  contactPoint: { telephone: '', email: '', contactType: 'customer service' },
};

function OrganizationCard({
  onDirtyChange, pendingRef,
}: {
  onDirtyChange: (dirty: boolean) => void;
  pendingRef: React.MutableRefObject<Organization | null>;
}) {
  const { data, isLoading } = useSetting<Organization>('organization');
  const [org, setOrg] = React.useState<Organization>(DEFAULT_ORG);

  React.useEffect(() => {
    if (data) {
      const next = { ...DEFAULT_ORG, ...data, contactPoint: { ...DEFAULT_ORG.contactPoint, ...(data.contactPoint ?? {}) }, sameAs: Array.isArray(data.sameAs) ? data.sameAs : [] };
      setOrg(next);
      pendingRef.current = next;
      onDirtyChange(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const patch = (p: Partial<Organization>) => {
    setOrg((o) => {
      const next = { ...o, ...p };
      pendingRef.current = next;
      return next;
    });
    onDirtyChange(true);
  };
  const patchContact = (p: Partial<Organization['contactPoint']>) => patch({ contactPoint: { ...org.contactPoint, ...p } });

  const [sameAsInput, setSameAsInput] = React.useState('');

  if (isLoading) return <Skeleton className="h-96 w-full rounded-spay-lg" />;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Display name"><Input value={org.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
            <Field label="Legal name"><Input value={org.legalName} onChange={(e) => patch({ legalName: e.target.value })} /></Field>
          </div>
          <Field label="Website URL"><Input value={org.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://spay.finance" className="font-mono" /></Field>
          <Field label="Logo URL" hint="Absolute or root-relative; appears in rich results."><Input value={org.logo} onChange={(e) => patch({ logo: e.target.value })} placeholder="/og-default.webp" className="font-mono text-xs" /></Field>
          <Field label="Description"><Textarea rows={2} value={org.description} onChange={(e) => patch({ description: e.target.value })} /></Field>

          <div>
            <Label>Same-as profile URLs</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {org.sameAs.map((u, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-line text-[11px] text-fg-2 font-mono max-w-full">
                  <span className="truncate max-w-[260px]">{u}</span>
                  <button
                    type="button"
                    onClick={() => patch({ sameAs: org.sameAs.filter((_, j) => j !== i) })}
                    className="text-fg-4 hover:text-danger shrink-0"
                    aria-label="Remove"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={sameAsInput}
                onChange={(e) => setSameAsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && sameAsInput.trim()) {
                    e.preventDefault();
                    patch({ sameAs: [...org.sameAs, sameAsInput.trim()] });
                    setSameAsInput('');
                  }
                }}
                placeholder="https://twitter.com/spay"
                className="font-mono text-xs"
              />
              <Button
                type="button" size="sm" variant="secondary"
                onClick={() => { if (sameAsInput.trim()) { patch({ sameAs: [...org.sameAs, sameAsInput.trim()] }); setSameAsInput(''); } }}
                disabled={!sameAsInput.trim()}
              >
                <Plus />Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input value={org.contactPoint.email} onChange={(e) => patchContact({ email: e.target.value })} placeholder="hello@spay.finance" /></Field>
          <Field label="Phone"><Input value={org.contactPoint.telephone} onChange={(e) => patchContact({ telephone: e.target.value })} placeholder="+1-555-123-4567" /></Field>
        </CardContent>
      </Card>
    </>
  );
}

