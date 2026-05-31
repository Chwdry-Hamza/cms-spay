'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className,
}: {
  page?: number;
  totalPages?: number;
  onPageChange?: (n: number) => void;
  className?: string;
}) {
  const pages = React.useMemo(() => {
    const arr: (number | '...')[] = [];
    const add = (n: number | '...') => arr.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (page > 3) add('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) add(i);
      if (page < totalPages - 2) add('...');
      add(totalPages);
    }
    return arr;
  }, [page, totalPages]);

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <Button
        variant="ghost"
        size="iconSm"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-fg-4 text-sm">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'outline' : 'ghost'}
            size="iconSm"
            onClick={() => onPageChange?.(p)}
            className={cn(
              'min-w-8',
              p === page && 'bg-cyan-300/10 border-cyan-300/40 text-cyan-300'
            )}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="iconSm"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
