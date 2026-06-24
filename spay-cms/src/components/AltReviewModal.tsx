'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toaster';
import { useUpdateMedia, type MediaItem } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';

/**
 * Post-upload alt-text review. Shown after media is uploaded (Media Library, or
 * a drag-and-drop into the featured / OG / Twitter image fields) so editors can
 * add alt text right away — good for accessibility and SEO.
 *
 *   items     — uploaded media needing review (empty = modal hidden)
 *   required  — when true, can't be dismissed until every alt is filled
 *   onClose   — close without forcing
 *   onSaved   — receives the items with their new alt (so callers can refresh
 *               any local copy, e.g. the featured-image preview)
 */
export function AltReviewModal({
  items, required, onClose, onSaved,
}: {
  items: MediaItem[];
  required: boolean;
  onClose: () => void;
  onSaved?: (saved: MediaItem[]) => void;
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
      // Hand back the items with their (possibly) updated alt text.
      onSaved?.(items.map((i) => ({ ...i, alt: drafts[i._id] ?? i.alt })));
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
              Skip — I&apos;ll do it later
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
