'use client';

import React from 'react';
import type { Editor as TiptapEditorType } from '@tiptap/react';
import {
  Twitter, Facebook, CheckCircle2, XCircle, AlertTriangle,
  Eye, EyeOff, ImageIcon as ImagePickerIcon,
  X, Image as ImageGlyph,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { type SEO, type MediaItem, type StructuredData, emptyStructuredData, type Performance, emptyPerformance, type CodeInjection, emptyCodeInjection, useUploadMedia, useMedia } from '@/lib/queries';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import { AltReviewModal } from '@/components/AltReviewModal';
import { useToast } from '@/components/ui/Toaster';
import { apiErrorMessage } from '@/lib/api';
import { Plus, Trash2, Code2, HelpCircle, Briefcase, Newspaper, Activity, Loader2, UploadCloud } from 'lucide-react';

// Used to build the canonical-URL preview. Driven by the deployed site URL so
// canonicals match the real domain; falls back to the production domain.
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://spay.finance').replace(/\/+$/, '');

const defaultSEO: SEO = {
  title: '', description: '', canonical: '', noindex: false, nofollow: false,
  og: { title: '', description: '', image: '' },
  twitter: { card: 'summary_large_image', title: '', description: '', image: '' },
};

/** Featured image stored as a populated Media doc or just an id */
type FeaturedImage = string | { _id: string; url: string; alt: string; variants?: Record<string, string>; width?: number; height?: number } | null | undefined;

type Props = {
  title: string;
  slug: string;
  seo: SEO | null | undefined;
  onChange: (next: SEO) => void;
  schema?: StructuredData | null | undefined;
  onSchemaChange?: (next: StructuredData) => void;
  performance?: Performance | null | undefined;
  onPerformanceChange?: (next: Performance) => void;
  codeInjection?: CodeInjection | null | undefined;
  onCodeInjectionChange?: (next: CodeInjection) => void;
  kind?: 'page' | 'post';
  editor?: TiptapEditorType | null;
  /** Used to fetch related-content suggestions */
  entityId?: string;
  category?: string;
  tags?: string[];
  /** Featured image (populated on fetch) */
  featuredImage?: FeaturedImage;
  /** Called with the media id (or null to clear) when featured image changes */
  onFeaturedImageChange?: (mediaId: string | null, picked?: MediaItem) => void;
};

export function SEOPanel({
  title, slug, seo: seoProp, onChange, schema: schemaProp, onSchemaChange,
  performance: perfProp, onPerformanceChange,
  codeInjection: codeProp, onCodeInjectionChange,
  kind = 'page', editor,
  featuredImage, onFeaturedImageChange,
}: Props) {
  const schema: StructuredData = React.useMemo(
    () => ({ ...emptyStructuredData, ...(schemaProp ?? {}) }),
    [schemaProp],
  );
  const patchSchema = (partial: Partial<StructuredData>) =>
    onSchemaChange?.({ ...schema, ...partial });

  const perf: Performance = React.useMemo(
    () => ({ ...emptyPerformance, ...(perfProp ?? {}) }),
    [perfProp],
  );
  const patchPerf = (partial: Partial<Performance>) =>
    onPerformanceChange?.({ ...perf, ...partial });

  const code: CodeInjection = React.useMemo(
    () => ({ ...emptyCodeInjection, ...(codeProp ?? {}) }),
    [codeProp],
  );
  const patchCode = (partial: Partial<CodeInjection>) =>
    onCodeInjectionChange?.({ ...code, ...partial });
  const codeBlockCount = [code.header, code.body, code.footer].filter((s) => s.trim()).length;
  const seo: SEO = React.useMemo(() => ({ ...defaultSEO, ...(seoProp ?? {}), og: { ...defaultSEO.og, ...(seoProp?.og ?? {}) }, twitter: { ...defaultSEO.twitter, ...(seoProp?.twitter ?? {}) } }), [seoProp]);
  const patch = (partial: Partial<SEO>) => onChange({ ...seo, ...partial });
  const patchOG = (partial: Partial<SEO['og']>) => onChange({ ...seo, og: { ...seo.og, ...partial } });
  const patchTW = (partial: Partial<SEO['twitter']>) => onChange({ ...seo, twitter: { ...seo.twitter, ...partial } });

  const displayTitle = seo.title || title;
  const titleLen = displayTitle.length;
  const descLen = seo.description.length;

  // ─── Auto canonical (used as placeholder + fallback display) ──
  const livePath = kind === 'page'
    ? (slug.startsWith('/') ? slug : '/' + (slug || ''))
    : `/blog/${slug.replace(/^\//, '')}`;
  const autoCanonical = `${SITE_ORIGIN}${livePath}`;

  // ─── Featured / OG / Twitter image picker state ───────────────
  const [pickerOpen, setPickerOpen] = React.useState<null | 'featured' | 'og' | 'twitter'>(null);
  const featured = typeof featuredImage === 'object' && featuredImage ? featuredImage : null;

  // ─── Drag-and-drop upload (featured / OG / Twitter images) ─────
  const upload = useUploadMedia();
  const { toast } = useToast();
  // After a drop-upload, prompt for alt text (same flow as the Media Library).
  const [altReviewItems, setAltReviewItems] = React.useState<MediaItem[]>([]);

  // Upload the first image file from a drop and return the created Media.
  const uploadOne = async (files: FileList | File[] | null | undefined): Promise<MediaItem | null> => {
    const file = Array.from(files ?? []).find((f) => f.type.startsWith('image/'));
    if (!file) {
      toast({ title: 'Drop an image file', description: 'Only image files can be uploaded here.', variant: 'warning' });
      return null;
    }
    try {
      const items = await upload.mutateAsync([file]);
      const media = items[0] ?? null;
      if (media) {
        toast({ title: 'Image uploaded', variant: 'success' });
        // Newly uploaded images have no alt yet — open the alt-text prompt.
        if (!media.alt?.trim()) setAltReviewItems([media]);
      }
      return media;
    } catch (err) {
      toast({ title: 'Upload failed', description: apiErrorMessage(err), variant: 'danger' });
      return null;
    }
  };

  const featuredAlt = featured?.alt ?? '';
  const featuredUrl = featured?.url ?? '';

  // Image-resolution chain: OG image → explicit value → featured image
  // Twitter image      → explicit value → OG image → featured image
  const resolvedOgImage = seo.og.image || featuredUrl;
  const resolvedTwitterImage = seo.twitter.image || resolvedOgImage;

  // Resolve the alt text of an explicitly-set OG/Twitter image by matching its
  // URL against the media library, so we can flag a missing-alt the same way the
  // featured image does. Falls back to undefined for external/unknown URLs.
  const { data: mediaImages = [] } = useMedia({ type: 'image' });
  const altForUrl = (url?: string): { known: boolean; alt: string } => {
    if (!url) return { known: false, alt: '' };
    const m = mediaImages.find((x) => x.url === url || x.variants?.thumbnail === url);
    return m ? { known: true, alt: m.alt ?? '' } : { known: false, alt: '' };
  };

  // Build the status badge + caption for a social image field, consistent with
  // the featured image (alt set / no alt + the alt text or a missing-alt error).
  const socialMeta = (explicitUrl: string, fallbackBadgeText: string) => {
    if (explicitUrl) {
      const { known, alt } = altForUrl(explicitUrl);
      if (known && !alt.trim()) {
        return {
          badge: <Badge variant="warning" size="sm">no alt</Badge>,
          caption: <span className="text-danger">Missing alt text — add it for SEO &amp; accessibility.</span>,
        };
      }
      if (known) {
        return {
          badge: <Badge variant="success" size="sm">alt set</Badge>,
          caption: <span className="text-fg-3 italic">&quot;{alt}&quot;</span>,
        };
      }
      return { badge: undefined, caption: undefined }; // external / unknown URL
    }
    return { badge: <Badge variant="default" size="sm">{fallbackBadgeText}</Badge>, caption: undefined };
  };
  const ogMeta = socialMeta(seo.og.image, featuredUrl ? 'using featured' : 'not set');
  const twitterMeta = socialMeta(seo.twitter.image ?? '', resolvedOgImage ? 'using OG / featured' : 'not set');

  // ─── Optional content warnings ─────────────────────────────────
  const warnings = React.useMemo(() => {
    const items: { title: string }[] = [];
    if (!editor) return items;

    let h1Count = 0;
    let internalLinks = 0;
    const walk = (node: any) => {
      if (!node) return;
      if (node.type === 'heading' && node.attrs?.level === 1) h1Count++;
      const link = node.marks?.find((m: any) => m.type === 'link');
      if (link?.attrs?.href && !/^https?:\/\//i.test(link.attrs.href)) internalLinks++;
      if (node.content) node.content.forEach(walk);
    };
    walk(editor.getJSON());

    if (h1Count === 0)        items.push({ title: 'Missing H1' });
    else if (h1Count > 1)     items.push({ title: `Multiple H1 headings (${h1Count})` });

    if (internalLinks === 0)  items.push({ title: 'No internal links' });

    if (!featured)            items.push({ title: 'No featured image' });
    else if (!featuredAlt)    items.push({ title: 'Featured image missing alt text' });

    return items;
  }, [editor, editor?.state.doc, featured, featuredAlt]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['basics', 'warnings']}>
          <AccordionItem value="basics" className="px-5">
            <AccordionTrigger>Basics</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="seo-title">SEO title</Label>
                  <span className={cn('font-mono text-[10px]',
                    titleLen > 60 ? 'text-warning' : titleLen < 30 ? 'text-fg-4' : 'text-success'
                  )}>
                    {titleLen}/60
                  </span>
                </div>
                <Input
                  id="seo-title"
                  value={seo.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder={title || 'Title shown in search results'}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="meta-desc">Meta description</Label>
                  <span className={cn('font-mono text-[10px]',
                    descLen > 160 ? 'text-warning' : descLen < 120 ? 'text-warning' : 'text-success'
                  )}>
                    {descLen}/160
                  </span>
                </div>
                <Textarea
                  id="meta-desc"
                  rows={3}
                  value={seo.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="120–160 characters summarizing the page"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="canonical">Canonical URL</Label>
                  {!seo.canonical && (
                    <Badge variant="cyan" size="sm">auto</Badge>
                  )}
                </div>
                <Input
                  id="canonical"
                  className="mt-1.5 font-mono"
                  value={seo.canonical}
                  onChange={(e) => patch({ canonical: e.target.value })}
                  placeholder={autoCanonical}
                />
                {seo.canonical && (
                  <p className="text-[11px] text-fg-4 mt-1.5 leading-relaxed">
                    Override active. <button type="button" className="text-cyan-300 hover:underline" onClick={() => patch({ canonical: '' })}>Reset to auto</button>.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Featured image */}
          <AccordionItem value="featured" className="px-5">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                Featured image
                {featured ? (
                  featuredAlt
                    ? <Badge variant="success" size="sm">alt set</Badge>
                    : <Badge variant="warning" size="sm">no alt</Badge>
                ) : (
                  <Badge variant="default" size="sm">not set</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <ImageField
                label="Featured image"
                statusBadge={
                  featured
                    ? (featuredAlt ? <Badge variant="success" size="sm">alt set</Badge> : <Badge variant="warning" size="sm">no alt</Badge>)
                    : <Badge variant="default" size="sm">not set</Badge>
                }
                previewUrl={featuredUrl || undefined}
                emptyText="No image — pick from library or drop a file"
                pickLabel={featured ? 'Change' : 'Pick'}
                onPick={() => setPickerOpen('featured')}
                onRemove={featured ? () => onFeaturedImageChange?.(null) : undefined}
                removeLabel="Remove"
                caption={
                  featured
                    ? (featuredAlt
                        ? <span className="text-fg-3 italic">&quot;{featuredAlt}&quot;</span>
                        : <span className="text-danger">Missing alt text — add it for SEO &amp; accessibility.</span>)
                    : undefined
                }
                uploading={upload.isPending}
                onDropFiles={async (files) => { const m = await uploadOne(files); if (m) onFeaturedImageChange?.(m._id, m); }}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="warnings" className="px-5">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                Issues
                <Badge variant={warnings.length ? 'warning' : 'success'} size="sm">
                  {warnings.length ? String(warnings.length) : 'all clear'}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {warnings.length === 0 ? (
                <div className="flex items-start gap-2.5 p-3 rounded-spay-md border border-success/30 bg-success/[0.06]">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-success" />
                  <p className="text-sm text-fg-1">All checks pass.</p>
                </div>
              ) : (
                warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-spay-md border border-warning/30 bg-warning/[0.06]">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-warning" />
                    <p className="text-sm text-fg-1">{w.title}</p>
                  </div>
                ))
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="indexing" className="px-5">
            <AccordionTrigger>Indexing</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-spay-md border border-line cursor-pointer">
                <div className="flex items-center gap-2.5">
                  {seo.noindex ? <EyeOff className="size-4 text-fg-3" /> : <Eye className="size-4 text-cyan-300" />}
                  <div>
                    <p className="text-sm font-medium text-fg-1">Allow indexing</p>
                  </div>
                </div>
                <Switch checked={!seo.noindex} onCheckedChange={(v) => patch({ noindex: !v })} />
              </label>
              <label className="flex items-center justify-between p-3 rounded-spay-md border border-line cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-fg-1">Allow link following</p>
                </div>
                <Switch checked={!seo.nofollow} onCheckedChange={(v) => patch({ nofollow: !v })} />
              </label>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social" className="px-5">
            <AccordionTrigger>Open Graph &amp; Twitter</AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="og">
                <TabsList className="w-full">
                  <TabsTrigger value="og" className="flex-1"><Facebook className="size-3" />Open Graph</TabsTrigger>
                  <TabsTrigger value="tw" className="flex-1"><Twitter className="size-3" />Twitter</TabsTrigger>
                </TabsList>

                <TabsContent value="og" className="space-y-3">
                  <div>
                    <Label>OG title</Label>
                    <Input className="mt-1.5" value={seo.og.title} onChange={(e) => patchOG({ title: e.target.value })} placeholder={displayTitle} />
                  </div>
                  <div>
                    <Label>OG description</Label>
                    <Textarea className="mt-1.5" rows={2} value={seo.og.description} onChange={(e) => patchOG({ description: e.target.value })} placeholder={seo.description} />
                  </div>
                  <ImageField
                    label="OG image"
                    statusBadge={ogMeta.badge}
                    previewUrl={resolvedOgImage || undefined}
                    emptyText="No image — pick from library or drop a file"
                    pickLabel={seo.og.image ? 'Change' : 'Pick'}
                    onPick={() => setPickerOpen('og')}
                    onRemove={seo.og.image ? () => patchOG({ image: '' }) : undefined}
                    removeLabel="Remove"
                    caption={ogMeta.caption}
                    uploading={upload.isPending}
                    onDropFiles={async (files) => { const m = await uploadOne(files); if (m) patchOG({ image: m.url }); }}
                  />
                </TabsContent>

                <TabsContent value="tw" className="space-y-3">
                  <div>
                    <Label>Twitter card type</Label>
                    <select
                      value={seo.twitter.card}
                      onChange={(e) => patchTW({ card: e.target.value })}
                      className="mt-1.5 h-9 w-full rounded-spay-md border border-line bg-surface-raised px-3 text-sm text-fg-1 focus:outline-none focus:border-cyan-300/60"
                    >
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                  <div>
                    <Label>Twitter title</Label>
                    <Input className="mt-1.5" value={seo.twitter.title} onChange={(e) => patchTW({ title: e.target.value })} placeholder={displayTitle} />
                  </div>
                  <div>
                    <Label>Twitter description</Label>
                    <Textarea className="mt-1.5" rows={2} value={seo.twitter.description} onChange={(e) => patchTW({ description: e.target.value })} placeholder={seo.description} />
                  </div>
                  <ImageField
                    label="Twitter image"
                    statusBadge={twitterMeta.badge}
                    previewUrl={resolvedTwitterImage || undefined}
                    emptyText="No image — pick from library or drop a file"
                    pickLabel={seo.twitter.image ? 'Change' : 'Pick'}
                    onPick={() => setPickerOpen('twitter')}
                    onRemove={seo.twitter.image ? () => patchTW({ image: '' }) : undefined}
                    removeLabel="Remove"
                    caption={twitterMeta.caption}
                    uploading={upload.isPending}
                    onDropFiles={async (files) => { const m = await uploadOne(files); if (m) patchTW({ image: m.url }); }}
                  />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="schema" className="px-5">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                Structured Data
                <Badge variant={schema.type === 'none' ? 'default' : 'cyan'} size="sm">
                  {schema.type === 'none' ? 'None' : schema.type.toUpperCase()}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <SchemaTypePicker
                value={schema.type}
                kind={kind}
                onChange={(t) => patchSchema({ type: t })}
              />

              {schema.type === 'article' && (
                <div className="rounded-spay-md border border-cyan-300/25 bg-cyan-300/[0.04] p-3 text-xs text-fg-3 leading-relaxed">
                  Article JSON-LD is built automatically from this page's title, description, featured image,
                  publish date, and the global Organization (publisher). No extra fields needed.
                </div>
              )}

              {schema.type === 'faq' && (
                <FaqEditor
                  items={schema.faq}
                  onChange={(faq) => patchSchema({ faq })}
                />
              )}

              {schema.type === 'service' && (
                <ServiceEditor
                  value={schema.service}
                  fallbackName={title}
                  onChange={(service) => patchSchema({ service })}
                />
              )}

              {schema.type === 'custom' && (
                <CustomJsonLdEditor
                  value={schema.customJsonLd}
                  onChange={(customJsonLd) => patchSchema({ customJsonLd })}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="performance" className="px-5">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                Performance
                {perf.skipAnalytics && (
                  <Badge variant="warning" size="sm">Custom</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2.5">
              {/* Skip GA4 / GTM on this page (e.g. legal / confirmation pages). */}
              <PerfToggle
                icon={Activity}
                title="Disable analytics"
                checked={perf.skipAnalytics}
                onChange={(v) => patchPerf({ skipAnalytics: v })}
              />
            </AccordionContent>
          </AccordionItem>

          {onCodeInjectionChange && (
            <AccordionItem value="code-injection" className="px-5">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  Code Injection
                  <Badge variant={codeBlockCount ? 'cyan' : 'default'} size="sm">
                    {codeBlockCount ? `${codeBlockCount} active` : 'none'}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <CodeBlockField
                  label="Header"
                  value={code.header}
                  onChange={(v) => patchCode({ header: v })}
                  placeholder={'<!-- e.g. <script src="https://example.com/pixel.js"></script> -->'}
                />
                <CodeBlockField
                  label="Body"
                  value={code.body}
                  onChange={(v) => patchCode({ body: v })}
                  placeholder={'<!-- markup or scripts to run inside the page body -->'}
                />
                <CodeBlockField
                  label="Footer"
                  value={code.footer}
                  onChange={(v) => patchCode({ footer: v })}
                  placeholder={'<!-- e.g. deferred <script> tags -->'}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Media picker — context-aware per which field opened it */}
        <MediaPickerModal
          open={!!pickerOpen}
          onOpenChange={(o) => !o && setPickerOpen(null)}
          accept="image"
          onPick={(media) => {
            if (pickerOpen === 'featured') {
              onFeaturedImageChange?.(media._id, media);
            } else if (pickerOpen === 'og') {
              patchOG({ image: media.url });
            } else if (pickerOpen === 'twitter') {
              patchTW({ image: media.url });
            }
            setPickerOpen(null);
          }}
        />

        {/* Alt-text prompt after a drag-and-drop upload (featured / OG / Twitter) */}
        <AltReviewModal
          items={altReviewItems}
          required={false}
          onClose={() => setAltReviewItems([])}
          onSaved={(saved) => {
            // If the saved image is the current featured/cover, refresh its alt
            // so the preview + "missing alt" warning update immediately.
            const f = saved.find((s) => featured && s._id === featured._id);
            if (f) onFeaturedImageChange?.(f._id, f);
          }}
        />

      </div>
    </div>
  );
}

/**
 * Unified image control used by the Featured, OG, and Twitter fields so they all
 * look the same: label + status badge on top, a preview that accepts drag-and-drop
 * upload, the Pick/Change + Remove/Clear buttons below it, then an optional caption.
 */
function ImageField({
  label, statusBadge, previewUrl, emptyText, pickLabel, onPick, onRemove, removeLabel, caption, onDropFiles, uploading,
}: {
  label: string;
  statusBadge?: React.ReactNode;
  previewUrl?: string;
  emptyText: string;
  pickLabel: string;
  onPick: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  caption?: React.ReactNode;
  onDropFiles?: (files: FileList | File[]) => void;
  uploading?: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {statusBadge}
      </div>
      <div
        className={cn(
          'relative rounded-spay-md border bg-surface/40 overflow-hidden transition-colors',
          dragging ? 'border-cyan-300/60 ring-2 ring-cyan-300/20' : 'border-line',
        )}
        onDragOver={onDropFiles ? (e) => { e.preventDefault(); if (!dragging) setDragging(true); } : undefined}
        onDragLeave={onDropFiles ? (e) => { e.preventDefault(); setDragging(false); } : undefined}
        onDrop={onDropFiles ? (e) => { e.preventDefault(); setDragging(false); onDropFiles(e.dataTransfer?.files); } : undefined}
      >
        {(dragging || uploading) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 rounded-spay-md border-2 border-dashed border-cyan-300/60 bg-surface-deepest/80 backdrop-blur-sm pointer-events-none">
            {uploading ? <Loader2 className="size-5 animate-spin text-cyan-300" /> : <UploadCloud className="size-5 text-cyan-300" />}
            <p className="text-[11px] font-medium text-cyan-300">{uploading ? 'Uploading…' : 'Drop image to upload'}</p>
          </div>
        )}
        {previewUrl ? (
          <div className="aspect-[1.91/1] bg-surface relative overflow-hidden">
            <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[1.91/1] bg-surface flex items-center justify-center text-center px-3 text-fg-4 text-xs">
            {emptyText}
          </div>
        )}
        <div className="flex items-center gap-2 p-2 border-t border-line">
          <Button size="sm" variant="secondary" onClick={onPick}>
            <ImageGlyph className="size-3.5" />
            {pickLabel}
          </Button>
          {onRemove && (
            <Button size="sm" variant="ghost" className="text-fg-3 hover:text-fg-1" onClick={onRemove}>
              <X className="size-3.5" />
              {removeLabel}
            </Button>
          )}
        </div>
      </div>
      {caption && <div className="text-[11px] leading-relaxed">{caption}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Structured-data editors
 * ──────────────────────────────────────────────────────────────── */

const SCHEMA_OPTIONS: { value: StructuredData['type']; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'article', label: 'Article',      description: 'Auto-built from page fields. Best for blog-style content.',   icon: Newspaper },
  { value: 'faq',     label: 'FAQ',          description: 'Q&A list — eligible for "People also ask" rich results.',     icon: HelpCircle },
  { value: 'service', label: 'Service',      description: 'For services pages (consulting, cards, transfers…).',         icon: Briefcase },
  { value: 'custom',  label: 'Custom JSON-LD', description: 'Paste any valid schema.org JSON. Validated on save.',       icon: Code2 },
];

function SchemaTypePicker({
  value, kind, onChange,
}: {
  value: StructuredData['type'];
  kind: 'page' | 'post';
  onChange: (t: StructuredData['type']) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {SCHEMA_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-start gap-2 p-2.5 rounded-spay-sm border text-left transition-colors',
              selected
                ? 'border-cyan-300/50 bg-cyan-300/[0.08] text-fg-1'
                : 'border-line bg-surface/30 text-fg-3 hover:border-cyan-300/30 hover:text-fg-1',
            )}
          >
            <Icon className={cn('size-3.5 shrink-0 mt-0.5', selected ? 'text-cyan-300' : 'text-fg-4')} />
            <div className="min-w-0">
              <p className="text-xs font-medium">{opt.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FaqEditor({
  items, onChange,
}: {
  items: { q: string; a: string }[];
  onChange: (next: { q: string; a: string }[]) => void;
}) {
  const update = (idx: number, partial: Partial<{ q: string; a: string }>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...partial } : it)));
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, { q: '', a: '' }]);

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="rounded-spay-sm border border-line bg-surface/30 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-4">Q&A #{i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-fg-4 hover:text-danger transition-colors"
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <Input
            value={it.q}
            onChange={(e) => update(i, { q: e.target.value })}
            placeholder="Question (e.g. How long does verification take?)"
          />
          <Textarea
            rows={2}
            value={it.a}
            onChange={(e) => update(i, { a: e.target.value })}
            placeholder="Answer — plain text, no HTML."
          />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="w-full">
        <Plus />Add question
      </Button>
    </div>
  );
}

function ServiceEditor({
  value, fallbackName, onChange,
}: {
  value: StructuredData['service'];
  fallbackName: string;
  onChange: (next: StructuredData['service']) => void;
}) {
  const patch = (p: Partial<StructuredData['service']>) => onChange({ ...value, ...p });
  return (
    <div className="space-y-3">
      <div>
        <Label>Service name</Label>
        <Input
          className="mt-1.5"
          value={value.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder={fallbackName || 'Spay Card'}
        />
        <p className="text-[10px] text-fg-4 mt-1">Falls back to the page title.</p>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-1.5"
          rows={2}
          value={value.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="What does this service do?"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Service type</Label>
          <Input
            className="mt-1.5"
            value={value.serviceType}
            onChange={(e) => patch({ serviceType: e.target.value })}
            placeholder="e.g. Payment processing"
          />
        </div>
        <div>
          <Label>Area served</Label>
          <Input
            className="mt-1.5"
            value={value.areaServed}
            onChange={(e) => patch({ areaServed: e.target.value })}
            placeholder="e.g. United States"
          />
        </div>
      </div>
      <div>
        <Label>Price range <span className="text-fg-4 font-normal">(optional)</span></Label>
        <Input
          className="mt-1.5"
          value={value.priceRange}
          onChange={(e) => patch({ priceRange: e.target.value })}
          placeholder="e.g. Free or $0"
        />
      </div>
    </div>
  );
}

function CustomJsonLdEditor({
  value, onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  // Live JSON parse so users see errors before saving.
  const error = React.useMemo(() => {
    if (!value.trim()) return null;
    try {
      JSON.parse(value);
      return null;
    } catch (e: any) {
      return e?.message ?? 'Invalid JSON';
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>Raw JSON-LD</Label>
      <div className={cn(
        'rounded-spay-md border bg-surface-deepest overflow-hidden transition-colors',
        error ? 'border-danger/40' : 'border-line',
      )}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={10}
          placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Spay Card",\n  …\n}`}
          className="w-full p-3 bg-transparent font-mono text-[11px] text-fg-1 placeholder:text-fg-4 outline-none resize-y leading-relaxed"
        />
      </div>
      {error ? (
        <div className="flex items-start gap-1.5 text-[11px] text-danger">
          <XCircle className="size-3 mt-0.5 shrink-0" />
          <span>JSON parse error: {error}</span>
        </div>
      ) : value.trim() ? (
        <div className="flex items-start gap-1.5 text-[11px] text-success">
          <CheckCircle2 className="size-3 mt-0.5 shrink-0" />
          <span>Valid JSON — will be injected as-is on the live page.</span>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Code-injection textarea ────────────────────────────────────── */

function CodeBlockField({
  label, value, onChange, placeholder,
}: {
  label: string;
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
        {value.trim() && <Badge variant="cyan" size="sm">set</Badge>}
      </div>
      <div className="rounded-spay-md border border-line bg-surface-deepest overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={5}
          placeholder={placeholder}
          className="w-full p-3 bg-transparent font-mono text-[11px] text-fg-1 placeholder:text-fg-4 outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}

/* ─── Performance toggle row ─────────────────────────────────────── */

function PerfToggle({
  icon: Icon, title, checked, onChange, danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <label className={cn(
      'flex items-center gap-2.5 p-2.5 rounded-spay-sm border cursor-pointer transition-colors',
      danger ? 'border-warning/30 bg-warning/[0.04]' : 'border-line bg-surface/30 hover:bg-surface/60',
    )}>
      <Icon className={cn('size-3.5 shrink-0', checked ? (danger ? 'text-warning' : 'text-cyan-300') : 'text-fg-4')} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-fg-1">{title}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
    </label>
  );
}
