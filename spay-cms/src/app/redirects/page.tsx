'use client';

import React from 'react';
import {
  Search, ArrowRight, Trash2, X, ArrowRightLeft, Plus, Loader2,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRedirects, useCreateRedirect, useDeleteRedirect } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { relativeTime } from '@/lib/utils';

export default function RedirectsPage() {
  const [query, setQuery] = React.useState('');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const { toast } = useToast();

  const { data = [], isLoading } = useRedirects(query || undefined);
  const del = useDeleteRedirect();

  return (
    <PageContainer>
      <PageHeader
        title="Redirects"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />New redirect
          </Button>
        }
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input leftIcon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search source or destination…"
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-spay-sm" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ArrowRightLeft />}
                title={query ? 'No matching redirects' : 'No redirects yet'}
                description="Forward an old URL to a working page."
                action={!query ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus />New redirect</Button> : undefined}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">
                  <th className="text-left pl-4 px-2 py-2.5">From</th>
                  <th className="px-2 py-2.5 w-8" />
                  <th className="text-left px-2 py-2.5">To</th>
                  <th className="text-left px-2 py-2.5 hidden sm:table-cell">Created</th>
                  <th className="text-right px-4 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r._id} className="border-b border-line last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="pl-4 px-2 py-3 font-mono text-xs text-fg-1 truncate max-w-[260px]">{r.from}</td>
                    <td className="px-2 py-3"><ArrowRight className="size-3.5 text-fg-4" /></td>
                    <td className="px-2 py-3 font-mono text-xs text-cyan-300 truncate max-w-[260px]">{r.to}</td>
                    <td className="px-2 py-3 hidden sm:table-cell text-xs text-fg-3 whitespace-nowrap">{relativeTime(r.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="iconSm" onClick={() => setDeleteId(r._id)} aria-label="Delete redirect">
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <AddRedirectDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this redirect?</DialogTitle>
            <DialogDescription>Any visitors hitting the old URL will see a 404 instead.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" disabled={del.isPending} onClick={async () => {
              if (!deleteId) return;
              try {
                await del.mutateAsync(deleteId);
                toast({ title: 'Redirect deleted', variant: 'success' });
                setDeleteId(null);
              } catch (err) {
                toast({ title: 'Delete failed', description: apiErrorMessage(err), variant: 'danger' });
              }
            }}><Trash2 />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

/**
 * Create a custom redirect. Mirrors the backend rules (redirects.routes.ts):
 *   - `from` must be a site-relative path starting with "/" (max 500)
 *   - `to`   may be a relative path or an absolute URL (max 800)
 * A leading slash is auto-added to `from` if the user omits it.
 */
function AddRedirectDialog({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const create = useCreateRedirect();
  const { toast } = useToast();
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  // Reset fields whenever the dialog opens.
  React.useEffect(() => {
    if (open) { setFrom(''); setTo(''); }
  }, [open]);

  const normalizeFrom = (v: string) => {
    const t = v.trim();
    if (!t) return '';
    return t.startsWith('/') ? t : `/${t}`;
  };

  const cleanFrom = normalizeFrom(from);
  const cleanTo = to.trim();
  const isAbsolute = /^https?:\/\//i.test(cleanTo);
  const toValid = isAbsolute || cleanTo.startsWith('/');
  const canSave = cleanFrom.length > 1 && cleanTo.length > 0 && toValid && cleanFrom !== cleanTo;

  const submit = async () => {
    if (!canSave) return;
    try {
      await create.mutateAsync({ from: cleanFrom, to: cleanTo });
      toast({ title: 'Redirect created', variant: 'success' });
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Could not create redirect', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New redirect</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="redir-from">From</Label>
            <Input
              id="redir-from"
              className="mt-1.5 font-mono"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSave) submit(); }}
              placeholder="/old-page"
              autoFocus
            />
          </div>

          <div className="flex justify-center text-fg-4"><ArrowRight className="size-4" /></div>

          <div>
            <Label htmlFor="redir-to">To</Label>
            <Input
              id="redir-to"
              className="mt-1.5 font-mono"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSave) submit(); }}
              placeholder="/new-page"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSave || create.isPending}>
            {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            {create.isPending ? 'Creating…' : 'Create redirect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
