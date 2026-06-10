'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search, Filter, MoreHorizontal,
  Plus, Trash2, FileText, X,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toaster';
import { usePages, useDeletePage, type ContentStatus } from '@/lib/queries';
import { relativeTime } from '@/lib/utils';
import { DeleteWithLinksDialog } from '@/components/DeleteWithLinksDialog';

export default function PagesPage() {
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<Set<ContentStatus>>(new Set());
  const [page, setPage] = React.useState(1);
  const [deleteEntity, setDeleteEntity] = React.useState<{ id: string; title: string; slug: string } | null>(null);
  const { toast } = useToast();

  const params = React.useMemo(
    () => ({
      q: query || undefined,
      status: statusFilter.size ? Array.from(statusFilter).join(',') : undefined,
      page,
      limit: 10,
    }),
    [query, statusFilter, page]
  );

  const { data, isLoading, isFetching } = usePages(params);
  const deletePage = useDeletePage();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleStatus = (s: ContentStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteEntity) return;
    await deletePage.mutateAsync(deleteEntity.id);
    toast({ title: 'Page deleted', variant: 'success' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Pages"
        actions={
          <>
            <Button size="sm" asChild>
              <Link href="/pages/new">
                <Plus />
                New page
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input
              leftIcon={<Search />}
              placeholder="Search pages by title or slug…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Filter />
                Status
                {statusFilter.size > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-spay-pill bg-cyan-300/15 text-[10px] text-cyan-300 font-mono">
                    {statusFilter.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={statusFilter.has('published')} onCheckedChange={() => toggleStatus('published')}>Published</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.has('draft')} onCheckedChange={() => toggleStatus('draft')}>Draft</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.has('scheduled')} onCheckedChange={() => toggleStatus('scheduled')}>Scheduled</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-2 py-2.5">
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
                  <Skeleton className="h-5 w-20 rounded-spay-pill" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FileText />}
                title={query || statusFilter.size ? 'No pages match your filters' : 'No pages yet'}
                description={query || statusFilter.size ? 'Try removing filters.' : 'Create your first page to get started.'}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left pl-4 px-2 py-2.5"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">Title</span></th>
                  <th className="text-left px-2 py-2.5 hidden md:table-cell"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">Status</span></th>
                  <th className="text-left px-2 py-2.5 hidden sm:table-cell"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">Updated</span></th>
                  <th className="text-right px-4 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  return (
                    <tr key={p._id} className="border-b border-line last:border-b-0 group transition-colors hover:bg-white/[0.02]">
                      <td className="pl-4 px-2 py-3 min-w-[220px]">
                        <Link href={`/pages/${p._id}`} className="font-medium text-fg-1 hover:text-cyan-300 transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell"><StatusBadge status={p.status} /></td>
                      <td className="px-2 py-3 hidden sm:table-cell text-fg-3 text-xs whitespace-nowrap">{relativeTime(p.updatedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="iconSm"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem destructive onSelect={() => setDeleteEntity({ id: p._id, title: p.title, slug: p.slug })}>
                              <Trash2 />Delete
                            </DropdownMenuItem>
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

        <div className="px-4 py-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-fg-3">
            {total === 0 ? 'No results' : (
              <>
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of <span className="text-fg-1 font-medium">{total}</span>
                {isFetching && <span className="ml-2 text-fg-4">refreshing…</span>}
              </>
            )}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      {/* Delete confirmation — with incoming-links warning + optional redirect */}
      <DeleteWithLinksDialog
        open={!!deleteEntity}
        onOpenChange={(o) => !o && setDeleteEntity(null)}
        entity={deleteEntity ? { type: 'page', ...deleteEntity } : null}
        onConfirmDelete={handleDelete}
      />
    </PageContainer>
  );
}
