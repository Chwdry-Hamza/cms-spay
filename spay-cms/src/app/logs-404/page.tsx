'use client';

import React from 'react';
import {
  Search, MoreHorizontal, ArrowRightLeft, Trash2, Check, AlertOctagon,
  X, ArrowRight,
} from 'lucide-react';
// (AlertOctagon still used by the per-row warning icon)
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/Dropdown';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useLogs404, useResolveLog404, useDeleteLog404, useCreateRedirect,
  type Log404,
} from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { relativeTime, formatNumber } from '@/lib/utils';

export default function Logs404Page() {
  const [query, setQuery] = React.useState('');
  const [redirectFor, setRedirectFor] = React.useState<Log404 | null>(null);
  const [redirectTo, setRedirectTo] = React.useState('');
  const { toast } = useToast();

  const { data, isLoading } = useLogs404(false);
  const resolveLog = useResolveLog404();
  const deleteLog = useDeleteLog404();
  const createRedirect = useCreateRedirect();

  const filtered = (data?.items ?? []).filter((l) =>
    query ? l.url.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <PageContainer>
      <PageHeader
        title="404 Logs"
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input leftIcon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search URL…"
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-spay-sm" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Check />}
                title="No active 404s"
                description="Everything that's been requested recently returned a 200. Nice work."
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">
                  <th className="text-left pl-4 px-2 py-2.5">Missing URL</th>
                  <th className="text-right px-2 py-2.5">Hits</th>
                  <th className="text-left px-2 py-2.5 hidden sm:table-cell">Last seen</th>
                  <th className="text-left px-2 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l._id} className="border-b border-line last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="pl-4 px-2 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertOctagon className="size-3.5 text-warning shrink-0" />
                        <code className="font-mono text-xs text-fg-1 truncate max-w-[280px]">{l.url}</code>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-xs font-semibold text-fg-1">{formatNumber(l.hits)}</td>
                    <td className="px-2 py-3 hidden sm:table-cell text-xs text-fg-3 whitespace-nowrap">{relativeTime(l.lastSeen)}</td>
                    <td className="px-2 py-3">
                      {l.resolved ? <Badge variant="success" size="sm">Resolved</Badge> : <Badge variant="warning" size="sm">Active</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="text-cyan-300 hover:text-cyan-300" onClick={() => { setRedirectFor(l); setRedirectTo(''); }}>
                          <ArrowRightLeft className="size-3.5" />
                          <span className="hidden sm:inline">Redirect</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="iconSm"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem destructive onSelect={async () => {
                              try {
                                await deleteLog.mutateAsync(l._id);
                                toast({ title: 'Log deleted', variant: 'success' });
                              } catch (err) {
                                toast({ title: 'Delete failed', description: apiErrorMessage(err), variant: 'danger' });
                              }
                            }}>
                              <Trash2 />Delete log
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Quick redirect dialog */}
      <Dialog open={!!redirectFor} onOpenChange={(o) => !o && setRedirectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create redirect</DialogTitle>
            <DialogDescription>
              Send <code className="font-mono text-fg-1">{redirectFor?.url}</code> to a working URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From</Label>
              <Input className="mt-1.5 font-mono" value={redirectFor?.url ?? ''} readOnly />
            </div>
            <div className="flex items-center justify-center text-fg-4"><ArrowRight className="size-4" /></div>
            <div>
              <Label htmlFor="r-to">To</Label>
              <Input id="r-to" className="mt-1.5 font-mono" placeholder="/new-path" autoFocus value={redirectTo} onChange={(e) => setRedirectTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRedirectFor(null)} disabled={createRedirect.isPending}>Cancel</Button>
            <Button
              disabled={!redirectTo || createRedirect.isPending}
              onClick={async () => {
                if (!redirectFor) return;
                try {
                  await createRedirect.mutateAsync({ from: redirectFor.url, to: redirectTo });
                  await resolveLog.mutateAsync({ id: redirectFor._id, resolved: true });
                  toast({ title: 'Redirect created', variant: 'success' });
                  setRedirectFor(null);
                } catch (err) {
                  toast({ title: 'Create failed', description: apiErrorMessage(err), variant: 'danger' });
                }
              }}
            >
              <ArrowRightLeft />
              {createRedirect.isPending ? 'Creating…' : 'Create redirect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
