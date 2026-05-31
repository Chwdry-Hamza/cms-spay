'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search, Filter, MoreHorizontal, Plus, Trash2,
  NotebookPen, X, LayoutGrid, List as ListIcon, Clock,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePosts, useDeletePost, type ContentStatus } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { relativeTime, cn } from '@/lib/utils';
import { DeleteWithLinksDialog } from '@/components/DeleteWithLinksDialog';

export default function PostsPage() {
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = React.useState<Set<ContentStatus>>(new Set());
  const [page, setPage] = React.useState(1);
  const [deleteEntity, setDeleteEntity] = React.useState<{ id: string; title: string; slug: string } | null>(null);
  const { toast } = useToast();

  const params = React.useMemo(
    () => ({
      q: query || undefined,
      status: statusFilter.size ? Array.from(statusFilter).join(',') : undefined,
      page,
      limit: view === 'grid' ? 8 : 10,
    }),
    [query, statusFilter, page, view]
  );

  const { data, isLoading, isFetching } = usePosts(params);
  const deletePost = useDeletePost();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleStatus = (s: ContentStatus) => {
    setStatusFilter((p) => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setPage(1);
  };
  const handleDelete = async () => {
    if (!deleteEntity) return;
    await deletePost.mutateAsync(deleteEntity.id);
    toast({ title: 'Post deleted', variant: 'success' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Blog posts"
        actions={
          <Button size="sm" asChild><Link href="/posts/new"><Plus />New post</Link></Button>
        }
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input
              leftIcon={<Search />}
              placeholder="Search posts, tags, or slugs…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1.5"><Filter />Status
                {statusFilter.size > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-spay-pill bg-cyan-300/15 text-[10px] text-cyan-300 font-mono">{statusFilter.size}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={statusFilter.has('published')} onCheckedChange={() => toggleStatus('published')}>Published</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.has('draft')} onCheckedChange={() => toggleStatus('draft')}>Draft</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.has('scheduled')} onCheckedChange={() => toggleStatus('scheduled')}>Scheduled</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center rounded-spay-md border border-line bg-surface p-0.5 ml-auto">
            <button onClick={() => setView('list')} className={cn('size-7 inline-flex items-center justify-center rounded-spay-sm transition-colors', view === 'list' ? 'bg-cyan-300/15 text-cyan-300' : 'text-fg-3 hover:bg-white/[0.06] hover:text-fg-1')}>
              <ListIcon className="size-3.5" />
            </button>
            <button onClick={() => setView('grid')} className={cn('size-7 inline-flex items-center justify-center rounded-spay-sm transition-colors', view === 'grid' ? 'bg-cyan-300/15 text-cyan-300' : 'text-fg-3 hover:bg-white/[0.06] hover:text-fg-1')}>
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </div>


        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-spay-sm" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<NotebookPen />} title={query || statusFilter.size ? 'No posts match' : 'No posts yet'} description="Write your first post to get started." />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4 items-stretch">
              {items.map((p) => (
                <Link href={`/posts/${p._id}`} key={p._id} className="spay-card-hover rounded-spay-md border border-line bg-surface/40 overflow-hidden group flex flex-col h-full">
                  <div className="aspect-[16/9] relative overflow-hidden shrink-0">
                    {p.cover ? <img src={p.cover} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/[0.06] to-navy-900" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                    <div className="absolute top-2 left-2"><StatusBadge status={p.status} /></div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    {p.categoryName && <p className="text-[10px] text-cyan-300 font-semibold uppercase tracking-[0.18em] mb-2">{p.categoryName}</p>}
                    <h3 className="font-display font-semibold text-fg-1 text-base leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">{p.title}</h3>
                    {p.excerpt && <p className="text-xs text-fg-3 leading-snug line-clamp-2 mt-1.5">{p.excerpt}</p>}
                    <div className="flex items-center justify-between text-[11px] text-fg-4 mt-auto pt-3 border-t border-line">
                      <span>{p.authorName || '—'}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" />{p.readTime || 5} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">
                  <th className="text-left pl-4 px-2 py-2.5">Title</th>
                  <th className="text-left px-2 py-2.5 hidden md:table-cell">Status</th>
                  <th className="text-left px-2 py-2.5 hidden lg:table-cell">Category</th>
                  <th className="text-left px-2 py-2.5 hidden sm:table-cell">Updated</th>
                  <th className="text-right px-4 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const cat = typeof p.category === 'object' ? p.category : null;
                  return (
                    <tr key={p._id} className="border-b border-line last:border-b-0 transition-colors hover:bg-white/[0.02]">
                      <td className="pl-4 px-2 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-spay-sm overflow-hidden border border-line shrink-0 bg-surface">
                            {p.cover && <img src={p.cover} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/posts/${p._id}`} className="font-medium text-fg-1 hover:text-cyan-300 transition-colors block truncate">{p.title}</Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell"><StatusBadge status={p.status} /></td>
                      <td className="px-2 py-3 hidden lg:table-cell">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-fg-2"><span className="size-2 rounded-full" style={{ background: cat.color }} />{cat.name}</span>
                        ) : p.categoryName ? <span className="text-xs text-fg-3">{p.categoryName}</span> : '—'}
                      </td>
                      <td className="px-2 py-3 hidden sm:table-cell text-fg-3 text-xs whitespace-nowrap">{relativeTime(p.updatedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="iconSm"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem destructive onSelect={() => setDeleteEntity({ id: p._id, title: p.title, slug: p.slug })}><Trash2 />Delete</DropdownMenuItem>
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
            {total === 0 ? 'No results' : (<>
              Showing {(page - 1) * (view === 'grid' ? 8 : 10) + 1}–{Math.min(page * (view === 'grid' ? 8 : 10), total)} of <span className="text-fg-1 font-medium">{total}</span>
              {isFetching && <span className="ml-2 text-fg-4">refreshing…</span>}
            </>)}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <DeleteWithLinksDialog
        open={!!deleteEntity}
        onOpenChange={(o) => !o && setDeleteEntity(null)}
        entity={deleteEntity ? { type: 'post', ...deleteEntity } : null}
        onConfirmDelete={handleDelete}
      />

    </PageContainer>
  );
}
