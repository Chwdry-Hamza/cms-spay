'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, FileText, NotebookPen, Image, ArrowRightLeft, LayoutDashboard, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import { COMMAND_ITEMS } from '@/lib/mock-data';

const ICON_BY_LABEL: Record<string, React.ComponentType<any>> = {
  'Go to Dashboard': LayoutDashboard,
  'Go to Pages': FileText,
  'Go to Blog Posts': NotebookPen,
  'Go to Media Library': Image,
  'Go to Redirects': ArrowRightLeft,
  'Go to SEO Settings': Search,
  'New page': Plus,
  'New blog post': Plus,
  'New redirect': Plus,
  'Upload media': Plus,
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(0);

  const flatItems = React.useMemo(() => {
    const list: { groupLabel: string; label: string; href?: string; shortcut?: string }[] = [];
    COMMAND_ITEMS.forEach((g) =>
      g.items.forEach((it) => list.push({ groupLabel: g.group, ...it }))
    );
    return list;
  }, []);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return flatItems;
    const q = query.toLowerCase();
    return flatItems.filter((it) => it.label.toLowerCase().includes(q));
  }, [query, flatItems]);

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((it) => {
      if (!map.has(it.groupLabel)) map.set(it.groupLabel, []);
      map.get(it.groupLabel)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  React.useEffect(() => {
    setSelected(0);
  }, [query, open]);

  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const handleSelect = (i: number) => {
    const item = filtered[i];
    if (!item) return;
    if (item.href) {
      router.push(item.href);
      onOpenChange(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(filtered.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selected);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="top-[20%] translate-y-0 max-w-xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search or run a command. Use arrow keys to navigate and Enter to select.
          </DialogDescription>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
            <Search className="size-4 text-fg-3" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search or run a command…"
              className="flex-1 bg-transparent text-sm text-fg-1 placeholder:text-fg-4 outline-none"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-fg-3">
                No results for <span className="text-fg-1 font-mono">"{query}"</span>
              </div>
            ) : (
              groups.map(([groupLabel, items]) => (
                <div key={groupLabel} className="mb-1">
                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-4">
                    {groupLabel}
                  </p>
                  <ul>
                    {items.map((it) => {
                      const globalIndex = filtered.indexOf(it);
                      const Icon = ICON_BY_LABEL[it.label] ?? ArrowRight;
                      const isSelected = globalIndex === selected;
                      return (
                        <li key={it.label}>
                          <button
                            onMouseEnter={() => setSelected(globalIndex)}
                            onClick={() => handleSelect(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                              isSelected
                                ? 'bg-cyan-300/10 text-fg-1'
                                : 'text-fg-2 hover:bg-white/[0.04]'
                            )}
                          >
                            <Icon
                              className={cn(
                                'size-4 shrink-0',
                                isSelected ? 'text-cyan-300' : 'text-fg-3'
                              )}
                            />
                            <span className="flex-1 text-left truncate">{it.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
