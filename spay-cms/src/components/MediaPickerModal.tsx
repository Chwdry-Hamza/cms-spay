'use client';

import React from 'react';
import { Search, X, Upload, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import { useMedia, useUploadMedia, type MediaItem } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * MediaPickerModal supports two modes:
 *   - default (single-pick): `onPick(media)` fires once.
 *   - multiple:              `onPickMany(media[])` fires once with the full list,
 *                            min/max enforced for the Insert button state.
 *
 * Either callback may be provided; if both are, single-pick wins. The
 * mode is determined by the `multiple` boolean prop.
 */
type SingleProps = {
  multiple?: false;
  onPick: (media: MediaItem) => void;
  onPickMany?: never;
  minPick?: never;
  maxPick?: never;
};
type MultiProps = {
  multiple: true;
  onPickMany: (media: MediaItem[]) => void;
  onPick?: never;
  minPick?: number;
  maxPick?: number;
};
type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  accept?: 'image' | 'video' | 'document' | 'all';
} & (SingleProps | MultiProps);

export function MediaPickerModal(props: Props) {
  const { open, onOpenChange, accept = 'image', multiple } = props;
  const { toast } = useToast();
  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState<MediaItem | null>(null);
  const [pickedMany, setPickedMany] = React.useState<MediaItem[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filter = React.useMemo(
    () => ({
      q: query || undefined,
      type: accept !== 'all' ? accept : undefined,
    }),
    [query, accept]
  );

  const { data = [], isLoading } = useMedia(filter);
  const upload = useUploadMedia();

  // Reset selection when reopened
  React.useEffect(() => {
    if (open) {
      setPicked(null);
      setPickedMany([]);
      setQuery('');
    }
  }, [open]);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    try {
      const items = await upload.mutateAsync(files);
      toast({ title: `Uploaded ${items.length} file${items.length === 1 ? '' : 's'}`, variant: 'success' });
      if (multiple) {
        setPickedMany((cur) => [...cur, ...items]);
      } else if (items[0]) {
        setPicked(items[0]);
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  const togglePickMany = (m: MediaItem) => {
    setPickedMany((cur) => (cur.some((p) => p._id === m._id) ? cur.filter((p) => p._id !== m._id) : [...cur, m]));
  };

  const minPick = multiple ? (props.minPick ?? 1) : 1;
  const maxPick = multiple ? (props.maxPick ?? 30) : 1;
  const tooFew  = multiple && pickedMany.length < minPick;
  const tooMany = multiple && pickedMany.length > maxPick;

  const handleConfirm = () => {
    if (multiple) {
      if (tooFew || tooMany) return;
      props.onPickMany(pickedMany);
    } else {
      if (!picked) return;
      props.onPick(picked);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!upload.isPending) onOpenChange(o); }}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {multiple ? 'Pick images for the gallery' : 'Pick from media library'}
          </DialogTitle>
          <DialogDescription>
            {multiple
              ? `Click each image to select. Pick ${minPick}–${maxPick} files.`
              : 'Choose an existing file or upload a new one.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input
              leftIcon={<Search />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or alt text…"
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            {upload.isPending ? 'Uploading…' : 'Upload new'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : '*/*'}
            multiple={!!multiple}
            className="sr-only"
            onChange={(e) => {
              const f = Array.from(e.target.files ?? []);
              handleUpload(f);
              if (e.target) e.target.value = '';
            }}
          />
        </div>

        <div className="px-6 pt-4 pb-4 max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-spay-md" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-fg-3 rounded-spay-md border border-dashed border-line">
              <ImageIcon className="size-6 mx-auto mb-2 text-fg-4" />
              {query
                ? <>No media matches <span className="font-mono text-fg-1">&quot;{query}&quot;</span></>
                : 'No media yet — upload some files to get started.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {data.map((m) => {
                const isSelected = multiple
                  ? pickedMany.some((p) => p._id === m._id)
                  : picked?._id === m._id;
                // In multi mode, find the 1-based selection order for the badge
                const orderIdx = multiple
                  ? pickedMany.findIndex((p) => p._id === m._id)
                  : -1;
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => (multiple ? togglePickMany(m) : setPicked(m))}
                    onDoubleClick={() => {
                      if (multiple) {
                        togglePickMany(m);
                      } else {
                        setPicked(m);
                        props.onPick(m);
                        onOpenChange(false);
                      }
                    }}
                    className={cn(
                      'group relative rounded-spay-md border bg-surface/40 overflow-hidden transition-all text-left',
                      isSelected
                        ? 'border-cyan-300/60 ring-2 ring-cyan-300/30 scale-[1.02]'
                        : 'border-line hover:border-line-strong hover:scale-[1.01]'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-10 size-5 rounded-full bg-cyan-300 text-navy-950 flex items-center justify-center text-[10px] font-bold shadow-glow-sm">
                        {multiple ? orderIdx + 1 : <CheckCircle2 className="size-3.5" />}
                      </div>
                    )}
                    {m.isWebP && (
                      <Badge variant="cyan" size="sm" className="absolute top-2 right-2 z-10">WebP</Badge>
                    )}
                    <div className="aspect-square bg-surface relative overflow-hidden">
                      {m.type === 'image' ? (
                        <img
                          src={m.variants?.thumbnail || m.url}
                          alt={m.alt}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-fg-3">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-medium text-fg-1 truncate" title={m.name}>{m.name}</p>
                      <p className="text-[10px] text-fg-4 truncate mt-0.5 italic">
                        {m.alt || <span className="text-danger not-italic">missing alt</span>}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected file preview (single mode) */}
        {!multiple && picked && (
          <div className="border-t border-line bg-surface/40 px-6 py-3 flex items-center gap-3">
            <div className="size-12 rounded-spay-sm overflow-hidden border border-line bg-surface shrink-0">
              {picked.type === 'image' ? (
                <img src={picked.variants?.thumbnail || picked.url} alt={picked.alt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-fg-3"><ImageIcon className="size-4" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-fg-1 truncate">{picked.name}</p>
              <p className="text-[11px] text-fg-3 truncate">
                {picked.alt ? <span className="italic">&quot;{picked.alt}&quot;</span> : <span className="text-danger">No alt text — edit it in Media Library</span>}
                {picked.width && picked.height ? <span className="text-fg-4 ml-2 font-mono">{picked.width}×{picked.height}</span> : null}
              </p>
            </div>
          </div>
        )}

        {/* Selection count strip (multi mode) */}
        {multiple && (
          <div className="border-t border-line bg-surface/40 px-6 py-3 flex items-center gap-3">
            <span className="text-sm text-fg-1">
              <span className="text-cyan-300 font-semibold">{pickedMany.length}</span> selected
              <span className="text-fg-4 text-xs ml-2">({minPick}–{maxPick} required)</span>
            </span>
            {pickedMany.length > 0 && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setPickedMany([])}>
                <X />Clear
              </Button>
            )}
          </div>
        )}

        <DialogFooter className="px-6 pb-6 pt-3 border-t border-line">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={multiple ? tooFew || tooMany : !picked}
          >
            <CheckCircle2 />
            {multiple
              ? `Insert ${pickedMany.length || ''} image${pickedMany.length === 1 ? '' : 's'}`.trim()
              : 'Use this image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
