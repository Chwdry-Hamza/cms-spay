'use client';

import React from 'react';
import { FileText, NotebookPen } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Page, Post, Paged } from '@/lib/queries';

type RedirectTarget = { title: string; path: string; type: 'page' | 'post' };

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Only fetch suggestions while the host (dialog) is open. */
  enabled?: boolean;
  /** A path to exclude from suggestions (e.g. the redirect's own source). */
  excludePath?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

/**
 * Redirect-destination input with type-ahead suggestions of existing pages and
 * posts. Type to filter by title or path, or just type a raw path. Shared by
 * the delete-with-redirect dialog and the 404-logs redirect dialog.
 *
 * The suggestions box closes on outside-click (via a wrapping ref) rather than
 * the input's blur — blur fires the moment you grab the list's scrollbar, which
 * would make it impossible to scroll.
 */
export function RedirectDestinationInput({
  value,
  onChange,
  enabled = true,
  excludePath,
  id,
  className,
  placeholder = 'Search a page/post or type a path…',
  autoFocus,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Existing pages + posts to suggest. Only fetched while the host is open.
  const { data: pagesResp } = useQuery({
    queryKey: ['pages', { page: 1, limit: 100 }],
    queryFn: () => api.get<Paged<Page>>('/api/pages', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    enabled,
    staleTime: 60_000,
  });
  const { data: postsResp } = useQuery({
    queryKey: ['posts', { page: 1, limit: 100 }],
    queryFn: () => api.get<Paged<Post>>('/api/posts', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    enabled,
    staleTime: 60_000,
  });

  const destinations: RedirectTarget[] = [
    ...(pagesResp?.items ?? []).map((p): RedirectTarget => ({
      title: p.title,
      path: p.slug.startsWith('/') ? p.slug : '/' + p.slug,
      type: 'page',
    })),
    ...(postsResp?.items ?? []).map((p): RedirectTarget => ({
      title: p.title,
      path: `/blog/${p.slug}`,
      type: 'post',
    })),
  ].filter((d) => d.path !== excludePath);

  const q = value.trim().toLowerCase();
  const match = (d: RedirectTarget) =>
    !q || d.title.toLowerCase().includes(q) || d.path.toLowerCase().includes(q);
  const pageMatches = destinations.filter((d) => d.type === 'page' && match(d));
  const postMatches = destinations.filter((d) => d.type === 'post' && match(d));
  const hasMatches = pageMatches.length + postMatches.length > 0;

  const renderItem = (d: RedirectTarget) => (
    <button
      key={`${d.type}-${d.path}`}
      type="button"
      // Prevent the input's blur from firing before the click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => { onChange(d.path); setOpen(false); }}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-spay-sm text-left hover:bg-white/[0.05] transition-colors"
    >
      {d.type === 'page'
        ? <FileText className="size-3.5 text-fg-3 shrink-0" />
        : <NotebookPen className="size-3.5 text-fg-3 shrink-0" />}
      <span className="text-xs font-medium text-fg-1 truncate">{d.title}</span>
      <span className="ml-auto font-mono text-[11px] text-fg-4 truncate max-w-[45%]">{d.path}</span>
    </button>
  );

  return (
    <div ref={boxRef}>
      <Input
        id={id}
        className={className}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        autoFocus={autoFocus}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && hasMatches && (
        <div className="mt-1 max-h-52 overflow-y-auto rounded-spay-md border border-line bg-surface/60 p-1 space-y-0.5">
          {pageMatches.length > 0 && (
            <>
              <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">Pages</p>
              {pageMatches.map(renderItem)}
            </>
          )}
          {postMatches.length > 0 && (
            <>
              <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4">Posts</p>
              {postMatches.map(renderItem)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
