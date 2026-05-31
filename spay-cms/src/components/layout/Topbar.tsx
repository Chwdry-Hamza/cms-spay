'use client';

import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Topbar({
  onOpenCommandPalette,
  onOpenMobileSidebar,
}: {
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
}) {
  return (
    /* The shell already pins this region; height shrinks on short viewports
       so editors get every line. */
    <header className="shrink-0 h-14 sm:h-16 border-b border-line bg-surface-deeper/85 backdrop-blur-xl">
        {/* 3-column layout: left = mobile menu + breadcrumbs, center = search,
            right = actions. flex-1 sides + centered child keeps the search bar
            visually centered regardless of how long the breadcrumbs get. */}
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center gap-3">
          {/* Left */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="iconSm"
              className="lg:hidden"
              onClick={onOpenMobileSidebar}
              aria-label="Open sidebar"
            >
              <Menu className="size-4" />
            </Button>
          </div>

          {/* Center — search */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 h-9 px-3 w-64 lg:w-80 xl:w-96 shrink-0 rounded-spay-md border border-line bg-surface-raised/60 text-sm text-fg-3 hover:border-line-strong hover:text-fg-2 transition-colors"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search or jump to…</span>
          </button>

          <Button
            variant="ghost"
            size="iconSm"
            className="md:hidden"
            onClick={onOpenCommandPalette}
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>

          {/* Right (spacer to keep the search bar centered) */}
          <div className="flex-1" />
        </div>
      </header>
  );
}
