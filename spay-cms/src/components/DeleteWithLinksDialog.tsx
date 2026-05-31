'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, AlertTriangle, Loader2, ArrowRightLeft, FileText, NotebookPen, CheckCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toaster';
import {
  useIncomingLinks, useCreateRedirect,
} from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** What we're about to delete */
  entity: { type: 'page' | 'post'; id: string; title: string; slug: string } | null;
  /** Called when the user confirms — returns a promise so we can show pending state */
  onConfirmDelete: () => Promise<void>;
};

/**
 * Generic delete-confirmation that:
 *   - scans for incoming internal links to the target,
 *   - warns the user with a count + list,
 *   - optionally creates a 301 redirect before deletion.
 */
export function DeleteWithLinksDialog({ open, onOpenChange, entity, onConfirmDelete }: Props) {
  const { toast } = useToast();
  const { data, isLoading } = useIncomingLinks(entity?.type ?? 'page', entity?.id, !!entity && open);
  const createRedirect = useCreateRedirect();

  const [withRedirect, setWithRedirect] = React.useState(true);
  const [redirectTo, setRedirectTo] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  // Reset state when the dialog opens
  React.useEffect(() => {
    if (open) {
      setWithRedirect(true);
      setRedirectTo('');
      setDeleting(false);
    }
  }, [open, entity?.id]);

  if (!entity) return null;

  const incoming = data?.items ?? [];
  const hasIncoming = incoming.length > 0;
  // For the redirect "from", a page slug is e.g. /about; a post is /blog/<slug>
  const fromPath = entity.type === 'page'
    ? (entity.slug.startsWith('/') ? entity.slug : '/' + entity.slug)
    : `/blog/${entity.slug}`;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Optionally insert the redirect BEFORE delete so the URL keeps working
      if (hasIncoming && withRedirect && redirectTo.trim()) {
        try {
          await createRedirect.mutateAsync({
            from: fromPath,
            to: redirectTo.trim(),
          });
        } catch (err) {
          toast({ title: 'Redirect failed', description: apiErrorMessage(err), variant: 'danger' });
          setDeleting(false);
          return;
        }
      }
      await onConfirmDelete();
      setDeleting(false);
      onOpenChange(false);
    } catch {
      setDeleting(false);
    }
  };

  const redirectInvalid =
    withRedirect && hasIncoming && (!redirectTo.trim() || redirectTo.trim() === fromPath);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!deleting) onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete "{entity.title}"?</DialogTitle>
        </DialogHeader>

        {/* Incoming-links section */}
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-spay-md" />
        ) : hasIncoming ? (
          <div className="rounded-spay-md border border-danger/30 bg-danger/[0.04] p-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-fg-1">
                  {data!.total} {data!.total === 1 ? 'page links' : 'pages link'} to this {entity.type}
                </p>
              </div>
            </div>

            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {incoming.slice(0, 6).map((ref) => (
                <li key={`${ref.sourceType}-${ref.sourceId}`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-spay-sm bg-surface/40">
                  {ref.sourceType === 'page' ? <FileText className="size-3.5 text-fg-3 shrink-0" /> : <NotebookPen className="size-3.5 text-fg-3 shrink-0" />}
                  <Link
                    href={`/${ref.sourceType === 'page' ? 'pages' : 'posts'}/${ref.sourceId}`}
                    className="font-medium text-fg-1 hover:text-cyan-300 transition-colors truncate"
                    target="_blank"
                  >
                    {ref.sourceTitle}
                  </Link>
                  <span className="font-mono text-fg-4 truncate">{ref.sourceType === 'page' ? ref.sourceSlug : '/blog/' + ref.sourceSlug}</span>
                  {ref.anchorTexts.length > 0 && (
                    <span className="ml-auto text-fg-3 italic truncate max-w-[140px]" title={ref.anchorTexts.join(', ')}>
                      "{ref.anchorTexts[0]}"{ref.anchorTexts.length > 1 ? ` +${ref.anchorTexts.length - 1}` : ''}
                    </span>
                  )}
                </li>
              ))}
              {incoming.length > 6 && (
                <li className="text-[11px] text-fg-4 text-center pt-1">…and {incoming.length - 6} more</li>
              )}
            </ul>

            <label className="flex items-center justify-between p-2 rounded-spay-sm border border-line bg-surface/40 cursor-pointer">
              <div className="flex items-start gap-2">
                <ArrowRightLeft className="size-3.5 text-cyan-300 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-fg-1">Create a 301 redirect</p>
                </div>
              </div>
              <Switch checked={withRedirect} onCheckedChange={setWithRedirect} />
            </label>

            {withRedirect && (
              <div className="space-y-1.5 pl-1">
                <Label htmlFor="redirect-to">Redirect destination</Label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-fg-3 shrink-0 max-w-[140px] truncate">{fromPath}</code>
                  <span className="text-fg-4">→</span>
                  <Input
                    id="redirect-to"
                    className="font-mono text-xs"
                    placeholder="/another-page"
                    value={redirectTo}
                    onChange={(e) => setRedirectTo(e.target.value)}
                  />
                </div>
                {redirectTo.trim() === fromPath && (
                  <p className="text-[11px] text-danger">Destination can't be the same as the source.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 rounded-spay-md border border-success/25 bg-success/[0.04] text-sm">
            <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
            <p className="text-fg-2">
              No internal links point here — safe to delete.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting || redirectInvalid}>
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {deleting ? 'Deleting…' : hasIncoming && withRedirect ? 'Redirect + delete' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
