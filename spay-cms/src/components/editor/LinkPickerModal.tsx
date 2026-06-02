'use client';

import React from 'react';
import {
  Search, FileText, NotebookPen, Link2, ExternalLink, Sparkles,
  AlertTriangle, Link2Off,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { usePages, usePosts, useSuggestions } from '@/lib/queries';

type Context = {
  /** id of the current page/post (so it never appears in its own suggestions) */
  excludeId?: string;
  excludeType?: 'page' | 'post';
  /** post-specific context */
  category?: string;
  tags?: string[];
};

export function LinkPickerModal({
  open,
  onOpenChange,
  onConfirm,
  onRemove,
  context = {},
  initialHref,
  initialNewTab,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (href: string, openInNewTab: boolean) => void;
  /** Called when the user clicks "Remove link" in edit mode */
  onRemove?: () => void;
  context?: Context;
  /** When editing an existing link: pre-fill href + new-tab flag */
  initialHref?: string;
  initialNewTab?: boolean;
}) {
  const isEdit = !!initialHref;

  const [query, setQuery] = React.useState('');
  const [newTab, setNewTab] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [selected, setSelected] = React.useState<{ href: string; title: string } | null>(null);
  const [tab, setTab] = React.useState<'suggested' | 'internal' | 'external'>('internal');

  const { data: pagesData } = usePages({ status: 'published,draft', limit: 100 });
  const { data: postsData } = usePosts({ status: 'published,draft', limit: 100 });

  const items = React.useMemo(() => {
    const list: { id: string; kind: 'page' | 'post'; title: string; slug: string; href: string; status: string }[] = [];
    pagesData?.items?.forEach((p) => list.push({
      id: p._id, kind: 'page', title: p.title, slug: p.slug,
      href: p.slug.startsWith('/') ? p.slug : '/' + p.slug,
      status: p.status,
    }));
    postsData?.items?.forEach((p) => list.push({
      id: p._id, kind: 'post', title: p.title, slug: p.slug,
      href: '/blog/' + p.slug,
      status: p.status,
    }));
    return list.filter((i) => {
      // Never list the page/post currently being edited (can't link to itself).
      if (context.excludeId && i.id === context.excludeId) return false;
      return query ? (i.title + ' ' + i.href).toLowerCase().includes(query.toLowerCase()) : true;
    });
  }, [pagesData, postsData, query, context.excludeId]);

  const { data: suggestions = [], isLoading: loadingSuggestions } = useSuggestions({
    ...context,
    limit: 8,
    enabled: open && tab === 'suggested',
  });

  // Default the initial tab + pre-fill on open
  React.useEffect(() => {
    if (open) {
      setQuery('');
      if (isEdit) {
        // Editing an existing link: pre-fill state + jump to the right tab
        const isExternal = /^https?:\/\//i.test(initialHref ?? '');
        setNewTab(!!initialNewTab);
        if (isExternal) {
          setUrl(initialHref!);
          setSelected(null);
          setTab('external');
        } else {
          setUrl('');
          setSelected({ href: initialHref!, title: initialHref! });
          setTab('internal');
        }
      } else {
        const hasContext = !!(context.category || context.tags?.length);
        setUrl('');
        setSelected(null);
        setNewTab(false);
        setTab(hasContext ? 'suggested' : 'internal');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConfirm = () => {
    if (tab === 'external' && url) onConfirm(url, newTab);
    else if (selected) onConfirm(selected.href, newTab);
    onOpenChange(false);
  };

  const canConfirm = tab === 'external' ? !!url : !!selected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEdit ? 'Edit link' : 'Insert link'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Change the destination, toggle new-tab, or remove the link entirely.'
              : 'Link to existing content, or paste an external URL.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setSelected(null); }}>
            <TabsList>
              <TabsTrigger value="suggested"><Sparkles className="size-3.5" /> Suggested</TabsTrigger>
              <TabsTrigger value="internal"><Link2 className="size-3.5" /> Internal</TabsTrigger>
              <TabsTrigger value="external"><ExternalLink className="size-3.5" /> External</TabsTrigger>
            </TabsList>

            {/* SUGGESTED */}
            <TabsContent value="suggested" className="mt-3 space-y-3">
              {loadingSuggestions ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-spay-sm" />)}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-fg-3">
                  No suggestions yet. Add a category or tags to this {context.excludeType ?? 'post'} to get matches.
                </div>
              ) : (
                <ul className="max-h-[280px] overflow-y-auto rounded-spay-md border border-line bg-surface/30 divide-y divide-line">
                  {suggestions.map((s) => {
                    const isSelected = selected?.href === s.url;
                    return (
                      <li key={`${s.kind}-${s._id}`}>
                        <button
                          onClick={() => setSelected({ href: s.url, title: s.title })}
                          className={cn(
                            'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
                            isSelected ? 'bg-cyan-300/10' : 'hover:bg-white/[0.04]'
                          )}
                        >
                          <div className={cn(
                            'size-8 rounded-spay-sm border flex items-center justify-center shrink-0 [&_svg]:size-4',
                            isSelected ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-300' : 'border-line bg-surface text-fg-3'
                          )}>
                            {s.kind === 'page' ? <FileText /> : <NotebookPen />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-fg-1 truncate">{s.title}</p>
                            <p className="font-mono text-xs text-fg-3 truncate">{s.url}</p>
                            {s.reasons.length > 0 && (
                              <p className="text-[11px] text-fg-4 truncate mt-1">{s.reasons.join(' · ')}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>

            {/* INTERNAL */}
            <TabsContent value="internal" className="mt-3 space-y-3">
              <Input
                leftIcon={<Search />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and posts…"
                autoFocus
              />
              <div className="max-h-[280px] overflow-y-auto rounded-spay-md border border-line bg-surface/30">
                {items.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-fg-3">No content matches</div>
                ) : (
                  <ul className="divide-y divide-line">
                    {items.slice(0, 12).map((it) => {
                      const isSelected = selected?.href === it.href;
                      return (
                        <li key={`${it.kind}-${it.id}`}>
                          <button
                            onClick={() => setSelected({ href: it.href, title: it.title })}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                              isSelected ? 'bg-cyan-300/10' : 'hover:bg-white/[0.04]'
                            )}
                          >
                            <div className={cn(
                              'size-8 rounded-spay-sm border flex items-center justify-center shrink-0 [&_svg]:size-4',
                              isSelected ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-300' : 'border-line bg-surface text-fg-3'
                            )}>
                              {it.kind === 'page' ? <FileText /> : <NotebookPen />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-fg-1 truncate">{it.title}</p>
                              <p className="font-mono text-xs text-fg-3 truncate">{it.href}</p>
                            </div>
                            <Badge variant={it.status === 'published' ? 'success' : it.status === 'scheduled' ? 'warning' : 'default'} size="sm">
                              {it.status}
                            </Badge>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </TabsContent>

            {/* EXTERNAL */}
            <TabsContent value="external" className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  leftIcon={<ExternalLink />}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                />
              </div>
              {url && !/^https?:\/\//i.test(url) && (
                <div className="flex items-start gap-2 p-3 rounded-spay-md border border-warning/30 bg-warning/5 text-sm">
                  <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-fg-2">External URLs should start with <code className="font-mono">https://</code>.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-5 pt-4 border-t border-line">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Switch checked={newTab} onCheckedChange={setNewTab} id="new-tab" />
              <span className="text-sm text-fg-2">Open in new tab</span>
            </label>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 mt-4 border-t border-line">
          {isEdit && onRemove && (
            <Button
              variant="ghost"
              className="text-danger hover:text-danger mr-auto"
              onClick={() => { onRemove(); onOpenChange(false); }}
            >
              <Link2Off />
              Remove link
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            <Link2 />
            {isEdit ? 'Update link' : 'Insert link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
