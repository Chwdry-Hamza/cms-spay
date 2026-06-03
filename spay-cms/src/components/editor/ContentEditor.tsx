'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import {
  ArrowLeft, History, Eye, ChevronDown, Save, Send, CalendarClock,
  MoreHorizontal, CheckCircle2, RefreshCw, Trash2, Search as SearchIcon,
  Wand2, Folder, Tag, X, Check, Monitor,
} from 'lucide-react';
import type { Editor as TiptapEditorType } from '@tiptap/react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toaster';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/Dropdown';
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/Tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/Dialog';
import { TiptapEditor } from './TiptapEditor';
import { EditorToolbar } from './EditorToolbar';
import { SEOPanel } from './SEOPanel';
import { RevisionDrawer } from './RevisionDrawer';
import { LinkPickerModal } from './LinkPickerModal';
import { LivePreviewPanel } from './LivePreviewPanel';
import { HomeContentEditor } from './HomeContentEditor';
import { DeleteWithLinksDialog } from '@/components/DeleteWithLinksDialog';
import { Drawer, DrawerContent } from '@/components/ui/Drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  usePage, useCreatePage, useUpdatePage, useDeletePage,
  usePost, useCreatePost, useUpdatePost, useDeletePost,
  useCategories,
  type Page, type Post, type ContentStatus, type Category,
} from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn, slugify, pickFields } from '@/lib/utils';

type Kind = 'page' | 'post';

/**
 * Pages whose visible content lives in hand-coded React components on
 * spay-website-next. The CMS editor surfaces SEO controls only — the body
 * is ignored on the live site, so we disable the rich-text editor.
 */
const RESERVED_PAGE_SLUGS = new Set([
  '/',
  '/about',
  '/card-terms',
  '/privacy-policy',
  '/prohibited-activities',
]);

// Origin of the live website — used to preview pages inside the CMS.
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

function emptyDraft(kind: Kind): Partial<Page & Post> {
  return {
    title: '',
    slug: '',
    status: 'draft' as ContentStatus,
    template: 'Content',
    content: emptyDoc,
    excerpt: '',
    cover: '',
    categoryName: '',
    tags: [],
    seo: {
      title: '', description: '', canonical: '', noindex: false, nofollow: false,
      og: { title: '', description: '', image: '' },
      twitter: { card: 'summary_large_image', title: '', description: '' },
    },
  };
}

export function ContentEditor({ kind }: { kind: Kind }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams() as { id?: string };
  const id = params.id;
  const isNew = !id || id === 'new';
  const { toast } = useToast();

  // ─── Server state ────────────────────────────────────────────
  const pageQuery = usePage(kind === 'page' ? id : undefined);
  const postQuery = usePost(kind === 'post' ? id : undefined);
  const query = kind === 'page' ? pageQuery : postQuery;
  const remote = query.data as (Page & Post) | undefined;

  const createPage = useCreatePage();
  const updatePage = useUpdatePage(id ?? '');
  const deletePage = useDeletePage();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(id ?? '');
  const deletePost = useDeletePost();

  // ─── Form state ──────────────────────────────────────────────
  const [draft, setDraft] = React.useState<Partial<Page & Post>>(() => emptyDraft(kind));
  const [dirty, setDirty] = React.useState(false);
  const [editor, setEditor] = React.useState<TiptapEditorType | null>(null);
  const [revisionsOpen, setRevisionsOpen] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [livePreviewOpen, setLivePreviewOpen] = React.useState(false);
  const [seoOpen, setSeoOpen] = React.useState(true);
  // Separate state for the mobile/tablet slide-over (lg-). Desktop uses the
  // inline `seoOpen` aside.
  const [seoDrawerOpen, setSeoDrawerOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  /** Once the user manually edits the slug input, stop auto-regenerating from title */
  const [slugTouched, setSlugTouched] = React.useState(false);

  // hydrate from server data
  React.useEffect(() => {
    if (remote) {
      setDraft(remote as Partial<Page & Post>);
      setDirty(false);
      setSaveStatus('saved');
      setLastSavedAt(new Date(remote.updatedAt));
      // Existing doc already has a slug — treat it as user-owned, don't auto-regen
      setSlugTouched(true);
    } else if (isNew) {
      setDraft(emptyDraft(kind));
      setDirty(false);
      // Brand-new doc: auto-track the title until the user touches the slug
      setSlugTouched(false);
    }
  }, [remote, isNew, kind]);

  const update = (partial: Partial<Page & Post>) => {
    setDraft((d) => ({ ...d, ...partial }));
    setDirty(true);
    setSaveStatus('unsaved');
  };

  // word count
  const text = React.useMemo(() => {
    if (!editor) return '';
    return editor.getText({ blockSeparator: ' ' });
  }, [editor, draft.content]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Reserved (code-driven) pages — editor body is read-only / hidden
  const isReservedPage =
    kind === 'page' && !!draft.slug && RESERVED_PAGE_SLUGS.has(draft.slug);
  // The home / landing page — supports an in-CMS live preview of the website.
  const isHomePage = kind === 'page' && draft.slug === '/';
  const livePreviewUrl = `${SITE_ORIGIN}/`;

  // ─── Mutations ───────────────────────────────────────────────
  const persist = async (overrides: Partial<Page & Post> = {}) => {
    setSaveStatus('saving');

    // Compute final slug + title
    const finalTitle = (overrides.title ?? draft.title ?? '').trim();
    const finalSlugRaw = (overrides.slug ?? draft.slug ?? '').trim();
    const finalSlug = finalSlugRaw || slugify(finalTitle || 'untitled');

    // Build a clean payload that only contains fields the backend accepts.
    // Strip _id/timestamps/category-object/etc that come from server data.
    const base = { ...draft, ...overrides, title: finalTitle, slug: finalSlug };
    const payload: any = kind === 'page'
      ? pickFields(base, ['title', 'slug', 'status', 'template', 'content', 'sections', 'excerpt', 'seo', 'schema', 'performance', 'featuredImage', 'scheduledAt'])
      : pickFields(base, ['title', 'slug', 'status', 'excerpt', 'content', 'cover', 'coverMedia', 'category', 'tags', 'readTime', 'seo', 'schema', 'performance', 'scheduledAt']);

    // Coerce populated refs (category / featuredImage / coverMedia) down to id strings
    if (kind === 'post' && payload.category && typeof payload.category === 'object') {
      payload.category = (payload.category as any)._id;
    }
    if (kind === 'page' && payload.featuredImage && typeof payload.featuredImage === 'object') {
      payload.featuredImage = (payload.featuredImage as any)._id;
    }
    if (kind === 'post' && payload.coverMedia && typeof payload.coverMedia === 'object') {
      payload.coverMedia = (payload.coverMedia as any)._id;
    }

    if (!finalTitle) {
      setSaveStatus('unsaved');
      toast({ title: 'Title is required', variant: 'warning' });
      return;
    }

    if (kind === 'post') {
      if (!payload.category) {
        setSaveStatus('unsaved');
        toast({ title: 'Category is required', description: 'Pick a category in the SEO panel before saving.', variant: 'warning' });
        return;
      }
      if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
        setSaveStatus('unsaved');
        toast({ title: 'At least one tag is required', description: 'Add a tag in the SEO panel before saving.', variant: 'warning' });
        return;
      }
    }

    try {
      let saved: any;
      if (isNew) {
        saved = kind === 'page'
          ? await createPage.mutateAsync(payload)
          : await createPost.mutateAsync(payload);
        toast({ title: `${kind === 'page' ? 'Page' : 'Post'} created`, variant: 'success' });
        router.replace(`/${kind === 'page' ? 'pages' : 'posts'}/${saved._id}`);
      } else {
        saved = kind === 'page'
          ? await updatePage.mutateAsync(payload)
          : await updatePost.mutateAsync(payload);
        toast({ title: 'Saved', variant: 'success' });
      }
      setDirty(false);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      return saved;
    } catch (err) {
      setSaveStatus('unsaved');
      const msg = apiErrorMessage(err);
      // eslint-disable-next-line no-console
      console.error('[persist] save failed', err, payload);
      toast({ title: 'Save failed', description: msg, variant: 'danger' });
      // intentionally don't re-throw — the toast is the user-facing error
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    try {
      if (kind === 'page') await deletePage.mutateAsync(id);
      else await deletePost.mutateAsync(id);
      toast({ title: 'Deleted', variant: 'success' });
      router.replace(`/${kind === 'page' ? 'pages' : 'posts'}`);
    } catch (err) {
      toast({ title: 'Delete failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  // Cmd+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty) persist();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (query.isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="size-8 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-spin" />
      </div>
    );
  }
  if (query.isError && !isNew) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <p className="text-fg-1 font-semibold">Could not load this {kind}</p>
        <p className="text-sm text-fg-3">{apiErrorMessage(query.error)}</p>
        <Button asChild size="sm" variant="secondary"><Link href={kind === 'page' ? '/pages' : '/posts'}>Back to list</Link></Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full min-h-0">
        {/* Sticky action bar.
            On small screens this can get crowded; allow horizontal scroll
            instead of wrapping (wrapping would jitter the editor height). */}
        <div className="sticky top-0 z-30 h-12 border-b border-line bg-surface-deeper/85 backdrop-blur-xl flex items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3 shrink-0 overflow-x-auto">
          <Button variant="ghost" size="iconSm" asChild>
            <Link href={kind === 'page' ? '/pages' : '/posts'} aria-label="Back">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="hidden md:flex items-center gap-2 min-w-0">
            {draft.status && <StatusBadge status={draft.status} />}
            <p className="text-sm font-semibold text-fg-1 truncate">
              {draft.title || (isNew ? 'Untitled' : '—')}
            </p>
          </div>

          <div className="hidden md:flex items-center ml-2 gap-1.5 text-xs text-fg-3">
            {saveStatus === 'saved' && lastSavedAt && (
              <><CheckCircle2 className="size-3.5 text-success" /><span>Saved {lastSavedAt.toLocaleTimeString()}</span></>
            )}
            {saveStatus === 'saving' && (<><RefreshCw className="size-3.5 animate-spin" /><span>Saving…</span></>)}
            {saveStatus === 'unsaved' && (<><span className="size-1.5 rounded-full bg-warning" /><span>Unsaved changes</span></>)}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {!isNew && (
              <Button variant="ghost" size="sm" onClick={() => setRevisionsOpen(true)}>
                <History />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}

            {!isNew && draft.slug && (
              <Button variant="secondary" size="sm" asChild>
                <a href={`http://localhost:3000${kind === 'page' ? (draft.slug.startsWith('/') ? draft.slug : '/' + draft.slug) : '/blog/' + draft.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye />
                  <span className="hidden sm:inline">Preview</span>
                </a>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSeoDrawerOpen(true)}
              aria-label="Open SEO panel"
            >
              <SearchIcon className="size-3.5" />
              <span className="hidden sm:inline">SEO</span>
            </Button>

            <Button variant="ghost" size="sm" disabled={!dirty || saveStatus === 'saving'} onClick={() => persist()}>
              <Save />
              <span className="hidden sm:inline">Save draft</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5" disabled={saveStatus === 'saving'}>
                  <Send className="size-3.5" />
                  {draft.status === 'published' ? 'Update' : 'Publish'}
                  <ChevronDown className="size-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Publish options</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => persist({ status: 'published' })}>
                  <Send />Publish now
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScheduleOpen(true)}>
                  <CalendarClock />Schedule for later…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="iconSm" aria-label="More"><MoreHorizontal /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSeoOpen((o) => !o)}>
                  {seoOpen ? 'Hide SEO panel' : 'Show SEO panel'}
                </DropdownMenuItem>
                <DropdownMenuItem>Word count: {wordCount}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isNew && (
                  <DropdownMenuItem destructive onSelect={() => setDeleteOpen(true)}>
                    <Trash2 />Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Editor + SEO panel split */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <EditorToolbar
              editor={editor}
              onInsertLink={() => setLinkOpen(true)}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
              <input
                value={draft.title ?? ''}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  // Auto-regenerate slug from title until the user manually edits the slug
                  const shouldAutoFill = !slugTouched && !isReservedPage;
                  if (shouldAutoFill) {
                    const baseSlug = slugify(nextTitle);
                    const newSlug = kind === 'page' && baseSlug ? '/' + baseSlug : baseSlug;
                    update({ title: nextTitle, slug: newSlug });
                  } else {
                    update({ title: nextTitle });
                  }
                }}
                className="w-full bg-transparent font-display font-bold text-2xl sm:text-3xl lg:text-[32px] tracking-[-0.025em] text-fg-1 placeholder:text-fg-4 outline-none border-0 leading-tight mb-2"
                placeholder="Untitled"
              />
              <div className="flex items-center gap-2 mb-4 text-fg-3 text-sm flex-wrap">
                <span className="text-fg-4">{kind === 'page' ? 'spay.finance' : 'spay.finance/blog/'}</span>
                <input
                  value={draft.slug ?? ''}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: e.target.value });
                  }}
                  placeholder={kind === 'page' ? '/slug' : 'slug'}
                  readOnly={isReservedPage}
                  title={isReservedPage ? 'Reserved page — slug is locked' : undefined}
                  className={cn(
                    'bg-transparent font-mono text-sm outline-none border-b border-dashed transition-colors min-w-[120px]',
                    isReservedPage
                      ? 'text-fg-3 border-line cursor-not-allowed'
                      : 'text-fg-2 border-line focus:border-cyan-300/40'
                  )}
                />
                {!isReservedPage && draft.title && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          const baseSlug = slugify(draft.title ?? '');
                          const newSlug = kind === 'page' && baseSlug ? '/' + baseSlug : baseSlug;
                          update({ slug: newSlug });
                          setSlugTouched(false);
                        }}
                        className="inline-flex items-center justify-center size-6 rounded-spay-sm text-fg-4 hover:text-cyan-300 hover:bg-cyan-300/[0.06] transition-colors"
                        aria-label="Regenerate slug from title"
                      >
                        <Wand2 className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate slug from title</TooltipContent>
                  </Tooltip>
                )}
                {!isReservedPage && isNew && !slugTouched && (
                  <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-300/70 ml-1">auto</span>
                )}
                {isReservedPage && (
                  <span className="text-[10px] uppercase tracking-[0.14em] text-fg-4 ml-1">locked</span>
                )}
              </div>
              {kind === 'post' && (
                <input
                  value={draft.excerpt ?? ''}
                  onChange={(e) => update({ excerpt: e.target.value })}
                  placeholder="Add an excerpt — shown in lists and search results"
                  className="w-full bg-transparent text-sm text-fg-2 placeholder:text-fg-4 outline-none border-0 mb-2 leading-relaxed"
                />
              )}

              {kind === 'post' && (
                <PostMetaBar
                  categoryId={
                    typeof (draft as any).category === 'string'
                      ? (draft as any).category
                      : ((draft as any).category?._id ?? '')
                  }
                  categoryName={(draft as any).categoryName ?? ''}
                  tags={(draft as any).tags ?? []}
                  onCategoryChange={(cat) =>
                    update({
                      category: cat?._id ?? undefined,
                      categoryName: cat?.name ?? '',
                    } as any)
                  }
                  onTagsChange={(tags) => update({ tags } as any)}
                />
              )}

              {isReservedPage ? (
                isHomePage ? (
                  livePreviewOpen ? (
                    <LivePreviewPanel
                      url={livePreviewUrl}
                      sections={draft.sections}
                      onClose={() => setLivePreviewOpen(false)}
                    />
                  ) : (
                    <div className="rounded-spay-md border border-dashed border-line bg-surface/30 p-8 text-center">
                      <p className="text-sm text-fg-3">
                        Edit the landing page content in the <span className="text-fg-1 font-medium">Content</span> tab on the right.
                      </p>
                      <p className="text-[11px] text-fg-4 mt-1">
                        Layout and animations stay in code. Save (and publish) to push changes live.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-5"
                        onClick={() => setLivePreviewOpen(true)}
                      >
                        <Monitor />
                        Live Preview
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="rounded-spay-md border border-dashed border-line bg-surface/30 p-8 text-center">
                    <p className="text-sm text-fg-3">
                      Body editor disabled for this page.
                    </p>
                    <p className="text-[11px] text-fg-4 mt-1">
                      Use the SEO panel on the right to update title, description, and social previews.
                    </p>
                  </div>
                )
              ) : (
                <TiptapEditor
                  value={draft.content || emptyDoc}
                  onChange={(json) => update({ content: json })}
                  onEditor={setEditor}
                />
              )}
            </div>

            <div className="sticky bottom-0 bg-surface-deeper/85 backdrop-blur-xl border-t border-line px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] text-fg-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span>{wordCount} words</span>
                <span className="hidden sm:inline">~ {Math.max(1, Math.ceil(wordCount / 220))} min read</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <kbd className="px-1.5 h-4 rounded-spay-xs bg-white/[0.06] border border-line font-mono text-[10px]">⌘ S</kbd>
                <span>to save</span>
              </div>
            </div>
          </div>

          {/* SEO panel — inline aside on lg+, slide-over Drawer on <lg.
              Props are identical so editors see the same UI in both. */}
          {(() => {
            const seoPanel = (
              <SEOPanel
                title={draft.title ?? ''}
                slug={draft.slug ?? ''}
                seo={draft.seo ?? null}
                onChange={(seo) => update({ seo })}
                schema={(draft as any).schema ?? null}
                onSchemaChange={(schema) => update({ schema } as any)}
                performance={(draft as any).performance ?? null}
                onPerformanceChange={(performance) => update({ performance } as any)}
                kind={kind}
                editor={editor}
                entityId={id && id !== 'new' ? id : undefined}
                category={draft.categoryName || undefined}
                tags={draft.tags}
                featuredImage={kind === 'page' ? draft.featuredImage : (draft as any).coverMedia}
                onFeaturedImageChange={(mediaId, picked) => {
                  // Store the populated Media object on the draft so the SEO panel
                  // preview updates immediately. persist() coerces it back to an _id
                  // string before sending to the backend.
                  const populated = mediaId
                    ? (picked ?? { _id: mediaId, url: '', alt: '' })
                    : null;
                  if (kind === 'page') {
                    update({ featuredImage: populated as any });
                  } else {
                    // Posts also keep the legacy `cover` URL field for listing cards.
                    update({
                      coverMedia: populated as any,
                      cover: picked?.url ?? '',
                    } as any);
                  }
                }}
              />
            );

            // On the homepage, the right panel hosts BOTH the content editor
            // and the SEO panel via a Content / SEO tab switcher. Everywhere
            // else it's just the SEO panel.
            const rightPanel = isHomePage ? (
              <Tabs defaultValue="content" className="flex flex-col h-full">
                <TabsList className="mx-4 mt-3 self-start">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-3 flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  <HomeContentEditor
                    value={draft.sections}
                    onChange={(next) => update({ sections: next } as any)}
                  />
                </TabsContent>
                <TabsContent value="seo" className="mt-3 flex-1 min-h-0 overflow-hidden">
                  {seoPanel}
                </TabsContent>
              </Tabs>
            ) : (
              seoPanel
            );

            return (
              <>
                {/* Desktop: inline column */}
                {seoOpen && (
                  <aside className="hidden lg:block w-[380px] xl:w-[420px] border-l border-line shrink-0 bg-surface-deeper/40 overflow-hidden">
                    {rightPanel}
                  </aside>
                )}

                {/* Mobile / tablet: slide-over.
                    Only mounts when opened so we don't double-compute the live
                    SEO audit (it re-reads the editor doc on every change). */}
                <Drawer open={seoDrawerOpen} onOpenChange={setSeoDrawerOpen}>
                  <DrawerContent
                    side="right"
                    className="w-full sm:max-w-md p-0 bg-surface-deeper lg:hidden"
                  >
                    {seoDrawerOpen && rightPanel}
                  </DrawerContent>
                </Drawer>
              </>
            );
          })()}
        </div>

        {!isNew && id && (
          <RevisionDrawer
            open={revisionsOpen}
            onOpenChange={setRevisionsOpen}
            entityType={kind}
            entityId={id}
          />
        )}
        <LinkPickerModal
          open={linkOpen}
          onOpenChange={setLinkOpen}
          context={{
            excludeId: id && id !== 'new' ? id : undefined,
            excludeType: kind,
            category: draft.categoryName || undefined,
            tags: draft.tags,
          }}
          // Pre-fill when the cursor is inside a link
          initialHref={editor?.isActive('link') ? (editor.getAttributes('link').href as string) : undefined}
          initialNewTab={editor?.isActive('link') ? editor.getAttributes('link').target === '_blank' : undefined}
          onRemove={() => {
            if (!editor) return;
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
          }}
          onConfirm={(href, openInNewTab) => {
            if (!editor) return;
            const attrs: any = { href };
            attrs.target = openInNewTab ? '_blank' : null;
            attrs.rel = openInNewTab ? 'noopener noreferrer' : null;

            const wasOnLink = editor.isActive('link');
            const { from, to } = editor.state.selection;

            if (wasOnLink) {
              // Update the existing link in place — extend the selection across the whole link first
              editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
            } else if (from === to) {
              // No selection, brand-new link → insert href as the anchor text
              editor.chain().focus().insertContent({
                type: 'text',
                text: href,
                marks: [{ type: 'link', attrs }],
              }).run();
            } else {
              // Wrap the existing selection
              editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
            }
          }}
        />

        {/* Delete — scans for incoming internal links + offers a 301 redirect */}
        <DeleteWithLinksDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          entity={
            id && !isNew && draft.title
              ? { type: kind, id, title: draft.title, slug: draft.slug ?? '' }
              : null
          }
          onConfirmDelete={handleDelete}
        />


        {/* Schedule for later */}
        <ScheduleDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          initial={draft.scheduledAt}
          onConfirm={(iso) => {
            setScheduleOpen(false);
            persist({ status: 'scheduled', scheduledAt: new Date(iso) as any });
          }}
        />
      </div>
    </TooltipProvider>
  );
}

/**
 * Category dropdown + tags chip input shown above the body editor on posts.
 * Category is required for posts to appear under /blog/category/* and for
 * sitemap-categories.xml to surface a useful URL; tags drive the post's
 * "related-posts" scoring (see public.routes.ts /suggestions).
 */
function PostMetaBar({
  categoryId,
  categoryName,
  tags,
  onCategoryChange,
  onTagsChange,
}: {
  categoryId: string;
  categoryName: string;
  tags: string[];
  onCategoryChange: (cat: Category | null) => void;
  onTagsChange: (tags: string[]) => void;
}) {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];
  const selected = categories.find((c) => c._id === categoryId) ?? null;
  const display = selected?.name ?? categoryName;

  const [tagInput, setTagInput] = React.useState('');

  const addTag = (raw: string) => {
    const next = raw.trim().replace(/^#/, '').toLowerCase();
    if (!next) return;
    if (tags.includes(next)) return;
    onTagsChange([...tags, next]);
  };

  const removeTag = (t: string) => onTagsChange(tags.filter((x) => x !== t));

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (tagInput.trim()) {
        e.preventDefault();
        addTag(tagInput);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 pb-4 border-b border-line">
      {/* Category */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-spay-sm border text-xs transition-colors',
              display
                ? 'border-cyan-300/30 bg-cyan-300/[0.06] text-cyan-300 hover:bg-cyan-300/[0.1]'
                : 'border-dashed border-line text-fg-3 hover:border-cyan-300/40 hover:text-cyan-300',
            )}
          >
            {selected && (
              <span className="size-2 rounded-full" style={{ background: selected.color }} />
            )}
            <Folder className="size-3.5" />
            {display || 'Choose category'}
            <ChevronDown className="size-3 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-[320px] overflow-y-auto">
          <DropdownMenuLabel>Assign to category</DropdownMenuLabel>
          {categoriesQuery.isLoading && (
            <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
          )}
          {!categoriesQuery.isLoading && categories.length === 0 && (
            <DropdownMenuItem disabled className="text-fg-4">
              No categories yet — create one in /categories
            </DropdownMenuItem>
          )}
          {categories.map((c) => (
            <DropdownMenuItem
              key={c._id}
              onSelect={() => onCategoryChange(c)}
              className="flex items-center gap-2"
            >
              <span className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
              {c._id === categoryId && <Check className="size-3.5 text-cyan-300 shrink-0" />}
            </DropdownMenuItem>
          ))}
          {selected && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onCategoryChange(null)} className="text-fg-3">
                Clear category
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
        <Tag className="size-3.5 text-fg-4 shrink-0" />
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-line text-[11px] text-fg-2 font-mono"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-fg-4 hover:text-danger transition-colors"
              aria-label={`Remove ${t}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKey}
          onBlur={() => {
            if (tagInput.trim()) {
              addTag(tagInput);
              setTagInput('');
            }
          }}
          placeholder={tags.length ? '' : 'Add tags — press Enter'}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-fg-1 placeholder:text-fg-4 outline-none border-0 py-0.5"
        />
      </div>
    </div>
  );
}

function ScheduleDialog({
  open, onOpenChange, initial, onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: string | Date | null;
  onConfirm: (iso: string) => void;
}) {
  // datetime-local needs "YYYY-MM-DDTHH:mm" (no seconds, no timezone)
  const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultDt = React.useMemo(() => {
    if (initial) {
      const d = typeof initial === 'string' ? new Date(initial) : initial;
      if (!isNaN(d.getTime())) return toLocalInput(d);
    }
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setSeconds(0, 0);
    return toLocalInput(tomorrow);
  }, [initial, open]);

  const [value, setValue] = React.useState(defaultDt);
  React.useEffect(() => { if (open) setValue(defaultDt); }, [open, defaultDt]);

  const selectedDate = new Date(value);
  const inPast = !isNaN(selectedDate.getTime()) && selectedDate.getTime() <= Date.now();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-cyan-300" />
            Schedule publish
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-3 mb-1.5 block">Publish at</span>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-10 rounded-spay-md border border-line bg-surface-raised px-3 text-sm text-fg-1 font-mono focus:outline-none focus:border-cyan-300/60 [color-scheme:dark]"
            />
          </label>
          {inPast && (
            <p className="text-xs text-warning">
              That time is already in the past — the post will publish on the next scheduler tick (within 60 seconds).
            </p>
          )}
          {!inPast && !isNaN(selectedDate.getTime()) && (
            <p className="text-xs text-fg-3">
              Will publish in {relativeFromNow(selectedDate)}.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm(new Date(value).toISOString())}>
            <CalendarClock />Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function relativeFromNow(d: Date): string {
  const diff = d.getTime() - Date.now();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'}`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}
