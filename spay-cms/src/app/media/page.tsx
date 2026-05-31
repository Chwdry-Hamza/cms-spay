'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Upload, Search, LayoutGrid, List as ListIcon, Image as ImageIcon, FileText, FileVideo,
  MoreHorizontal, Trash2, Copy, X, Loader2,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { useMedia, useUploadMedia, useUpdateMedia, useDeleteMedia, useMediaUsage, type MediaItem, type MediaUsageRef } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn, relativeTime } from '@/lib/utils';
import { AlertTriangle, FileEdit, Link as LinkIcon } from 'lucide-react';

function bytes(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' MB';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + ' KB';
  return n + ' B';
}
const typeIcon = { image: ImageIcon, video: FileVideo, document: FileText } as const;

export default function MediaPage() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [query, setQuery] = React.useState('');
  const [openItem, setOpenItem] = React.useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filter = React.useMemo(() => ({
    q: query || undefined,
  }), [query]);

  const { data = [], isLoading } = useMedia(filter);
  const upload = useUploadMedia();
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();

  // Items that just finished uploading and need alt text (drives the review modal).
  const [reviewItems, setReviewItems] = React.useState<MediaItem[]>([]);

  // Auto-open the system file picker when arriving via /media?upload=1
  // (used by the topbar "+ New" menu). Strip the query string after firing.
  const router = useRouter();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    if (searchParams.get('upload') === '1') {
      fileInputRef.current?.click();
      router.replace('/media');
    }
  }, [searchParams, router]);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    try {
      const items = await upload.mutateAsync(files);
      toast({ title: `Uploaded ${items.length} file${items.length === 1 ? '' : 's'}`, variant: 'success' });

      // Open the alt-text review modal for any newly-uploaded images. The modal
      // becomes blocking (can't be closed) when the requireAltOnUpload rule is on.
      const imagesNeedingAlt = items.filter((m) => m.type === 'image' && !m.alt?.trim());
      if (imagesNeedingAlt.length) setReviewItems(imagesNeedingAlt);
    } catch (err) {
      toast({ title: 'Upload failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Media Library"
        actions={
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            {upload.isPending ? 'Uploading…' : 'Upload files'}
          </Button>
        }
      />

      {/* Hidden file input — still triggered by the Upload button + ?upload=1 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          handleUpload(files);
          if (e.target) e.target.value = '';
        }}
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input leftIcon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or alt text…"
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
          <div className="hidden md:flex items-center rounded-spay-md border border-line bg-surface p-0.5 ml-auto">
            <button onClick={() => setView('grid')} className={cn('size-7 inline-flex items-center justify-center rounded-spay-sm transition-colors', view === 'grid' ? 'bg-cyan-300/15 text-cyan-300' : 'text-fg-3 hover:bg-white/[0.06] hover:text-fg-1')}>
              <LayoutGrid className="size-3.5" />
            </button>
            <button onClick={() => setView('list')} className={cn('size-7 inline-flex items-center justify-center rounded-spay-sm transition-colors', view === 'list' ? 'bg-cyan-300/15 text-cyan-300' : 'text-fg-3 hover:bg-white/[0.06] hover:text-fg-1')}>
              <ListIcon className="size-3.5" />
            </button>
          </div>
        </div>

        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-spay-md" />)}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<ImageIcon />}
              title={query ? 'No media matches' : 'No media yet'}
              description="Upload images, PDFs, or video clips to reuse them across your site."
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {data.map((m) => {
                const Icon = typeIcon[m.type];
                return (
                  <div key={m._id} className="spay-card-hover group relative rounded-spay-md border border-line bg-surface/40 overflow-hidden cursor-pointer"
                       onClick={() => setOpenItem(m)}>
                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                      {m.isWebP && <Badge variant="cyan" size="sm">WebP</Badge>}
                      {m.type === 'image' && !m.alt?.trim() && (
                        <Badge variant="danger" size="sm" className="inline-flex items-center gap-1">
                          <AlertTriangle className="size-2.5" />Alt
                        </Badge>
                      )}
                    </div>
                    <div className="aspect-square bg-surface relative overflow-hidden">
                      {m.type === 'image' ? (
                        <img src={m.variants?.thumbnail || m.url} alt={m.alt} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Icon className="size-8 text-fg-3" /></div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-fg-1 truncate" title={m.name}>{m.name}</p>
                      <p className="text-[10px] text-fg-4 mt-0.5 font-mono">{bytes(m.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">
                  <th className="text-left px-2 py-2.5">File</th>
                  <th className="text-left px-2 py-2.5 hidden md:table-cell">Alt text</th>
                  <th className="text-left px-2 py-2.5 hidden lg:table-cell">Dimensions</th>
                  <th className="text-right px-2 py-2.5">Size</th>
                  <th className="text-left px-2 py-2.5 hidden sm:table-cell">Uploaded</th>
                  <th className="text-right px-2 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {data.map((m) => {
                  const Icon = typeIcon[m.type];
                  return (
                    <tr key={m._id} className="border-b border-line last:border-b-0 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setOpenItem(m)}>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-spay-sm overflow-hidden border border-line shrink-0 bg-surface flex items-center justify-center">
                            {m.type === 'image' ? <img src={m.variants?.thumbnail || m.url} alt="" className="w-full h-full object-cover" /> : <Icon className="size-4 text-fg-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-fg-1 truncate">{m.name}</p>
                            <p className="text-xs text-fg-3 mt-0.5">{m.mime}</p>
                          </div>
                          {m.isWebP && <Badge variant="cyan" size="sm" className="ml-auto">WebP</Badge>}
                        </div>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell text-fg-2 truncate max-w-[260px]">{m.alt || <span className="text-danger">missing</span>}</td>
                      <td className="px-2 py-3 hidden lg:table-cell font-mono text-xs text-fg-3">{m.width && m.height ? `${m.width}×${m.height}` : '—'}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs text-fg-2">{bytes(m.size)}</td>
                      <td className="px-2 py-3 hidden sm:table-cell text-xs text-fg-3">{relativeTime(m.createdAt)}</td>
                      <td className="px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="iconSm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setOpenItem(m)}>Edit details</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { navigator.clipboard.writeText(m.url); toast({ title: 'URL copied' }); }}><Copy />Copy URL</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onSelect={() => setDeleteId(m._id)}><Trash2 />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{openItem?.name}</DialogTitle>
            <DialogDescription className="font-mono text-xs">{openItem?.mime}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {openItem && (
              <MediaDetailsForm
                item={openItem}
                onSave={async (body) => {
                  try {
                    const updated = await updateMedia.mutateAsync({ id: openItem._id, ...body });
                    toast({ title: 'Saved', variant: 'success' });
                    setOpenItem(updated);
                  } catch (err) {
                    toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
                  }
                }}
                onCopyUrl={() => { navigator.clipboard.writeText(openItem.url); toast({ title: 'URL copied' }); }}
                saving={updateMedia.isPending}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger mr-auto" onClick={() => openItem && setDeleteId(openItem._id)}>
              <Trash2 />Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpenItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-upload alt-text review */}
      <AltReviewModal
        items={reviewItems}
        required={false}
        onClose={() => setReviewItems([])}
      />

      {/* Delete confirm — surfaces usage count + linked pages before destruction */}
      <DeleteMediaDialog
        id={deleteId}
        deleting={deleteMedia.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteMedia.mutateAsync(deleteId);
            toast({ title: 'File deleted', variant: 'success' });
            setDeleteId(null);
            setOpenItem(null);
          } catch (err) {
            toast({ title: 'Delete failed', description: apiErrorMessage(err), variant: 'danger' });
          }
        }}
      />
    </PageContainer>
  );
}

function MediaDetailsForm({
  item, onSave, onCopyUrl, saving,
}: {
  item: MediaItem;
  onSave: (body: { name?: string; alt?: string }) => void;
  onCopyUrl: () => void;
  saving: boolean;
}) {
  const [name, setName] = React.useState(item.name);
  const [alt, setAlt] = React.useState(item.alt);

  React.useEffect(() => {
    setName(item.name); setAlt(item.alt);
  }, [item._id]);

  return (
    <>
      {item.type === 'image' && (
        <div className="rounded-spay-md border border-line overflow-hidden bg-surface">
          <img src={item.url} alt={item.alt} className="w-full h-auto block" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-1">Size</p>
          <p className="text-fg-1 font-mono">{bytes(item.size)}</p>
        </div>
        {item.width && (
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-1">Dimensions</p>
            <p className="text-fg-1 font-mono">{item.width}×{item.height}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-1">Uploaded</p>
          <p className="text-fg-1">{relativeTime(item.createdAt)}</p>
        </div>
        {item.isWebP && (
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-1">Optimized</p>
            <Badge variant="cyan" size="sm">WebP</Badge>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="m-filename">Display filename</Label>
        <Input id="m-filename" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-[11px] text-fg-4 mt-1.5">
          The public URL is fixed — renaming only changes how this file appears in lists and search.
        </p>
      </div>
      <div>
        <Label htmlFor="m-alt" className="flex items-center justify-between">
          <span>Alt text</span>
          {!alt.trim() && <Badge variant="danger" size="sm">missing</Badge>}
        </Label>
        <Input id="m-alt" className="mt-1.5" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe for accessibility & SEO" />
        <p className="text-[11px] text-fg-4 mt-1.5">Aim for under 125 characters · descriptive · keyword-aware.</p>
      </div>

      <UsageList mediaId={item._id} />

      <div>
        <Label>Public URL</Label>
        <div className="mt-1.5 flex">
          <input readOnly value={item.url} className="flex-1 h-9 rounded-l-spay-md border border-line bg-surface-raised px-3 text-sm text-fg-2 font-mono outline-none truncate" />
          <Button variant="secondary" size="sm" className="rounded-l-none border-l-0" onClick={onCopyUrl}><Copy /></Button>
        </div>
      </div>
      <Button onClick={() => onSave({ name, alt })} disabled={saving} className="w-full">
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </>
  );
}

/* ─── Usage list (used by drawer + delete dialog) ───────────────── */

function UsageList({ mediaId }: { mediaId: string }) {
  const { data, isLoading } = useMediaUsage(mediaId);
  if (isLoading) {
    return <div><p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-2">Used by</p><Skeleton className="h-12 w-full rounded-spay-sm" /></div>;
  }
  if (!data || data.total === 0) {
    return (
      <div>
        <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-2">Used by</p>
        <p className="text-xs text-fg-3 px-3 py-2 rounded-spay-sm border border-dashed border-line">
          Not referenced anywhere — safe to delete.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[10px] uppercase font-semibold tracking-[0.14em] text-fg-4 mb-2">
        Used by <span className="text-cyan-300 ml-1">{data.total}</span>
      </p>
      <ul className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
        {data.items.map((ref) => <UsageRow key={`${ref.type}-${ref.id}-${ref.via}`} ref={ref} />)}
      </ul>
    </div>
  );
}

function UsageRow({ ref }: { ref: MediaUsageRef }) {
  const href = ref.type === 'page' ? `/pages/${ref.id}` : `/posts/${ref.id}`;
  const viaLabel = ref.via === 'featured' ? 'Featured image' : 'Cover image';
  return (
    <li className="flex items-center gap-2 p-2 rounded-spay-sm border border-line bg-surface/30 hover:bg-surface/60 transition-colors">
      <FileEdit className="size-3.5 text-fg-4 shrink-0" />
      <a href={href} className="flex-1 min-w-0 text-xs text-fg-1 hover:text-cyan-300 truncate">
        {ref.title}
      </a>
      <span className="text-[10px] text-fg-4 shrink-0">{viaLabel}</span>
    </li>
  );
}

/* ─── Delete dialog with usage check ──────────────────────────── */

function DeleteMediaDialog({
  id, deleting, onCancel, onConfirm,
}: {
  id: string | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const open = !!id;
  const { data, isLoading } = useMediaUsage(id ?? undefined, open);
  const inUse = (data?.total ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this file?</DialogTitle>
          <DialogDescription>
            {isLoading
              ? 'Checking where this file is used…'
              : inUse
                ? `This file is referenced by ${data?.total} ${data?.total === 1 ? 'place' : 'places'}. Deleting it will leave broken images on those pages.`
                : 'No pages reference this file — safe to delete.'}
          </DialogDescription>
        </DialogHeader>
        {inUse && (
          <div className="rounded-spay-md border border-warning/30 bg-warning/[0.05] p-3 space-y-2 max-h-[220px] overflow-y-auto">
            {(data?.items ?? []).map((ref) => (
              <div key={`${ref.type}-${ref.id}-${ref.via}`} className="flex items-center gap-2 text-xs">
                <LinkIcon className="size-3 text-warning shrink-0" />
                <span className="flex-1 truncate text-fg-1">{ref.title}</span>
                <span className="text-[10px] text-fg-3 shrink-0">{ref.via}</span>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" disabled={deleting} onClick={onConfirm}>
            <Trash2 />{deleting ? 'Deleting…' : inUse ? 'Delete anyway' : 'Delete file'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Post-upload alt-text review modal ───────────────────────── */

function AltReviewModal({
  items, required, onClose,
}: {
  items: MediaItem[];
  required: boolean;
  onClose: () => void;
}) {
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const update = useUpdateMedia();
  const { toast } = useToast();

  // Reset when a new batch arrives.
  React.useEffect(() => {
    if (items.length) setDrafts(Object.fromEntries(items.map((i) => [i._id, i.alt ?? ''])));
  }, [items]);

  if (items.length === 0) return null;

  const missing = items.filter((i) => !(drafts[i._id] ?? '').trim()).length;
  const canSave = !required || missing === 0;

  const saveAll = async () => {
    const tasks = items
      .filter((i) => (drafts[i._id] ?? '') !== (i.alt ?? ''))
      .map((i) => update.mutateAsync({ id: i._id, alt: drafts[i._id] ?? '' }));
    try {
      await Promise.all(tasks);
      toast({ title: 'Alt text saved', variant: 'success' });
      onClose();
    } catch (err) {
      toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <Dialog
      open={items.length > 0}
      onOpenChange={(o) => {
        // When the rule is on, prevent close-by-clicking-outside.
        if (!o && !required) onClose();
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />
            Add alt text for {items.length} new image{items.length === 1 ? '' : 's'}
          </DialogTitle>
          <DialogDescription>
            {required
              ? 'Alt text is required by your media rules. Fill each one to continue — describe what the image shows so it works for screen readers and SEO.'
              : 'Recommended for accessibility and SEO. You can skip for now and edit later.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {items.map((m) => (
            <div key={m._id} className="flex gap-3 p-2.5 rounded-spay-md border border-line bg-surface/40">
              <div className="size-16 rounded-spay-sm overflow-hidden bg-surface shrink-0">
                <img src={m.variants?.thumbnail || m.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-mono text-fg-3 truncate" title={m.name}>{m.name}</p>
                <Textarea
                  rows={2}
                  value={drafts[m._id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [m._id]: e.target.value }))}
                  placeholder="e.g. Crypto-and-fiat balance shown in the Spay mobile app"
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          {!required && (
            <Button variant="ghost" onClick={onClose} className="mr-auto">
              Skip — I'll do it later
            </Button>
          )}
          {required && missing > 0 && (
            <p className="text-[11px] text-danger mr-auto self-center">
              {missing} still missing
            </p>
          )}
          <Button onClick={saveAll} disabled={!canSave || update.isPending}>
            {update.isPending ? <Loader2 className="animate-spin" /> : null}
            Save alt text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
