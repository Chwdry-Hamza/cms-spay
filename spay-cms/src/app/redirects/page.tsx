'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Plus, MoreHorizontal, ArrowRight, Trash2, Pencil, X, ArrowRightLeft, Upload,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useRedirects, useCreateRedirect, useUpdateRedirect, useDeleteRedirect,
  type Redirect,
} from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { relativeTime } from '@/lib/utils';
import { CSVImportModal } from '@/components/redirects/CSVImportModal';

export default function RedirectsPage() {
  const [query, setQuery] = React.useState('');
  const [modal, setModal] = React.useState<{ open: boolean; editing?: Redirect }>({ open: false });
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const { toast } = useToast();

  const { data = [], isLoading } = useRedirects(query || undefined);
  const create = useCreateRedirect();
  const update = useUpdateRedirect();
  const del = useDeleteRedirect();

  // Auto-open the "New redirect" modal when arriving via /redirects?new=1
  const router = useRouter();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModal({ open: true });
      router.replace('/redirects');
    }
  }, [searchParams, router]);

  return (
    <PageContainer>
      <PageHeader
        title="Redirects"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}>
              <Upload />Import CSV
            </Button>
            <Button size="sm" onClick={() => setModal({ open: true })}>
              <Plus />New redirect
            </Button>
          </>
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
                description="Add a redirect to forward old URLs."
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="iconSm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setModal({ open: true, editing: r })}><Pencil />Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onSelect={() => setDeleteId(r._id)}><Trash2 />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* CSV import */}
      <CSVImportModal open={importOpen} onOpenChange={setImportOpen} />

      {/* Create/Edit */}
      <RedirectModal
        state={modal}
        onClose={() => setModal({ open: false })}
        onSubmit={async (body) => {
          try {
            if (modal.editing) {
              await update.mutateAsync({ id: modal.editing._id, ...body });
              toast({ title: 'Redirect updated', variant: 'success' });
            } else {
              await create.mutateAsync(body);
              toast({ title: 'Redirect created', variant: 'success' });
            }
            setModal({ open: false });
          } catch (err) {
            toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
          }
        }}
        submitting={create.isPending || update.isPending}
      />

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

function RedirectModal({
  state, onClose, onSubmit, submitting,
}: {
  state: { open: boolean; editing?: Redirect };
  onClose: () => void;
  onSubmit: (body: Partial<Redirect>) => void;
  submitting: boolean;
}) {
  const editing = state.editing;
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  React.useEffect(() => {
    if (state.open) {
      setFrom(editing?.from ?? '');
      setTo(editing?.to ?? '');
    }
  }, [state.open, editing]);

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit redirect' : 'Add redirect'}</DialogTitle>
        </DialogHeader>

        {(() => {
          const fromTrim = from.trim();
          const toTrim = to.trim();
          const fromInvalid = fromTrim.length > 0 && !fromTrim.startsWith('/');
          // "to" is allowed to be /relative OR an http(s):// absolute URL.
          const toInvalid = toTrim.length > 0 && !toTrim.startsWith('/') && !/^https?:\/\//i.test(toTrim);
          const canSubmit = !!fromTrim && !!toTrim && !fromInvalid && !toInvalid && !submitting;

          return (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="from">From URL</Label>
                  <Input id="from" className="mt-1.5 font-mono" placeholder="/old-path" value={from} onChange={(e) => setFrom(e.target.value)} autoFocus />
                  {fromInvalid && <p className="text-[11px] text-danger mt-1.5">From URL must start with <code className="font-mono">/</code></p>}
                </div>
                <div>
                  <Label htmlFor="to">To URL</Label>
                  <Input id="to" className="mt-1.5 font-mono" placeholder="/new-path or https://…" value={to} onChange={(e) => setTo(e.target.value)} />
                  {toInvalid && <p className="text-[11px] text-danger mt-1.5">To URL must start with <code className="font-mono">/</code> or <code className="font-mono">https://</code></p>}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button
                  onClick={() => onSubmit({ from: fromTrim, to: toTrim })}
                  disabled={!canSubmit}
                >
                  <Plus />{submitting ? 'Saving…' : 'Save redirect'}
                </Button>
              </DialogFooter>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}
