'use client';

import React from 'react';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toaster';
import { useRevisions, useRestoreRevision, type Revision } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn, relativeTime } from '@/lib/utils';

export function RevisionDrawer({
  open,
  onOpenChange,
  entityType,
  entityId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entityType: 'page' | 'post';
  entityId?: string;
}) {
  const { data, isLoading, isError, error } = useRevisions(entityType, entityId);
  const restore = useRestoreRevision();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  const items = data?.items ?? [];

  const handleRestore = async (id: string) => {
    try {
      await restore.mutateAsync(id);
      toast({ title: 'Revision restored', variant: 'success' });
      setConfirmingId(null);
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Restore failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-line">
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4 text-cyan-300" />
            Revision history
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-spay-sm" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-sm text-danger">{apiErrorMessage(error)}</div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<History />}
                title="No revisions yet"
                description="Edit and save this content — every save creates a snapshot you can roll back to."
              />
            </div>
          ) : (
            <ul className="relative py-2">
              <span className="absolute left-7 top-3 bottom-3 w-px bg-line" />
              {items.map((r, i) => (
                <RevisionRow
                  key={r._id}
                  rev={r}
                  isFirst={i === 0}
                  isSelected={selected === r._id}
                  onSelect={() => setSelected(r._id)}
                  onRequestRestore={() => setConfirmingId(r._id)}
                  isConfirming={confirmingId === r._id}
                  onConfirmRestore={() => handleRestore(r._id)}
                  onCancelRestore={() => setConfirmingId(null)}
                  restoring={restore.isPending && confirmingId === r._id}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RevisionRow({
  rev, isFirst, isSelected, onSelect, isConfirming,
  onRequestRestore, onConfirmRestore, onCancelRestore, restoring,
}: {
  rev: Revision;
  isFirst: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isConfirming: boolean;
  onRequestRestore: () => void;
  onConfirmRestore: () => void;
  onCancelRestore: () => void;
  restoring: boolean;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          'w-full px-6 py-3 flex items-start gap-3 text-left relative transition-colors hover:bg-white/[0.02]',
          isSelected && 'bg-cyan-300/[0.04]'
        )}
      >
        <span
          className={cn(
            'shrink-0 size-2.5 mt-1.5 rounded-full border-2 z-[1]',
            isFirst ? 'bg-cyan-300 border-cyan-300 shadow-glow-sm' :
            isSelected ? 'bg-cyan-300 border-cyan-300' :
            'bg-surface border-line-strong'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-mono text-[11px] text-fg-3">#{rev._id.slice(-6)}</span>
            {rev.authorEmail && <span className="text-sm font-medium text-fg-1 truncate">{rev.authorEmail}</span>}
            {isFirst && <Badge variant="cyan" size="sm">Latest snapshot</Badge>}
          </div>
          <p className="text-[11px] text-fg-4 mt-1">
            {new Date(rev.createdAt).toLocaleString()} · {relativeTime(rev.createdAt)}
          </p>
        </div>
      </button>

      {isConfirming && (
        <div className="px-6 pb-4 ml-9 -mt-1">
          <div className="rounded-spay-md border border-warning/30 bg-warning/[0.05] p-3">
            <p className="text-sm font-medium text-fg-1 mb-3">Restore this revision?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={onCancelRestore} disabled={restoring}>Cancel</Button>
              <Button size="sm" onClick={onConfirmRestore} disabled={restoring}>
                {restoring ? <><Loader2 className="animate-spin" /> Restoring…</> : <><RotateCcw />Restore</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSelected && !isConfirming && (
        <div className="px-6 pb-4 ml-9 -mt-1 flex justify-end">
          <Button size="sm" variant="secondary" onClick={onRequestRestore}>
            <RotateCcw />
            Restore this version
          </Button>
        </div>
      )}
    </li>
  );
}
