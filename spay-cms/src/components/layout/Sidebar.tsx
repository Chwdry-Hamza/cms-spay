'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  NotebookPen,
  Folder,
  Image as ImageIcon,
  ArrowRightLeft,
  Search,
  Network,
  AlertOctagon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import { useAuth } from '@/lib/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchForRoute } from '@/lib/queries';

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  NotebookPen,
  Folder,
  Image: ImageIcon,
  ArrowRightLeft,
  Search,
  Network,
  AlertOctagon,
  BarChart3,
};

type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof ICON_MAP;
};

const SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Pages',         href: '/pages',      icon: 'FileText' },
      { label: 'Blog Posts',    href: '/posts',      icon: 'NotebookPen' },
      { label: 'Categories',    href: '/categories', icon: 'Folder' },
      { label: 'Media Library', href: '/media',      icon: 'Image' },
    ],
  },
  {
    heading: 'SEO',
    items: [
      { label: 'Redirects',    href: '/redirects', icon: 'ArrowRightLeft' },
      { label: 'SEO Settings', href: '/seo',       icon: 'Search' },
      { label: 'Sitemap',      href: '/sitemap',   icon: 'Network' },
      { label: '404 Logs',     href: '/logs-404',  icon: 'AlertOctagon' },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Analytics & Tracking', href: '/analytics', icon: 'BarChart3' },
    ],
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobile,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobile?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = user?.email ?? '';
  const initials = (displayName || 'A').slice(0, 2).toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'flex flex-col h-full bg-surface-deeper border-r border-line transition-[width] duration-200 ease-spay-out',
          collapsed ? 'w-[68px]' : 'w-[256px]'
        )}
      >
        {/* Brand — logo only; "Spay CMS" wordmark intentionally omitted. */}
        <div className="h-24 flex items-center justify-start px-4 border-b border-line shrink-0">
          <Link href="/" className="block" onClick={onMobileClose} aria-label="Spay CMS — Dashboard">
            <img
              src="/spayLogo.jpeg"
              alt="Spay"
              className={cn(
                'rounded-spay-md object-contain transition-[width,height]',
                collapsed ? 'w-9 h-9' : 'w-12 h-12'
              )}
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {SECTIONS.map((section, si) => (
            <div key={section.heading} className={cn('px-3', si > 0 && 'mt-4')}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-4">
                  {section.heading}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const active = isActive(item.href);
                  const warmCache = () => prefetchForRoute(qc, item.href);
                  const content = (
                    <Link
                      href={item.href}
                      prefetch
                      onClick={onMobileClose}
                      onMouseEnter={warmCache}
                      onFocus={warmCache}
                      onTouchStart={warmCache}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-spay-md px-2.5 py-2 text-sm transition-colors',
                        active
                          ? 'bg-cyan-300/10 text-cyan-300'
                          : 'text-fg-2 hover:bg-white/[0.04] hover:text-fg-1',
                        collapsed && 'justify-center'
                      )}
                    >
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-cyan-300 shadow-glow-sm" />
                      )}
                      <Icon className={cn('size-4 shrink-0', active && 'text-cyan-300')} />
                      {!collapsed && (
                        <span className="flex-1 truncate font-medium">{item.label}</span>
                      )}
                    </Link>
                  );
                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{content}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={10}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-line">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {!collapsed ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-spay-md p-2.5 bg-surface-raised/60 border border-line hover:border-line-strong hover:bg-surface-raised transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-300 to-magenta flex items-center justify-center text-navy-950 font-semibold text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg-1 truncate leading-tight">{displayName}</p>
                    <p className="text-[11px] text-fg-3 truncate leading-tight">{displayEmail}</p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-cyan-300 to-magenta flex items-center justify-center text-navy-950 font-semibold text-xs hover:ring-2 hover:ring-cyan-300/40 transition"
                >
                  {initials}
                </button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-fg-1 truncate">{displayName}</p>
                <p className="text-xs text-fg-3 truncate">{displayEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => logout()}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!mobile && (
            <button
              onClick={onToggleCollapsed}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 h-7 rounded-spay-sm text-[11px] font-medium text-fg-4 hover:text-fg-2 hover:bg-white/[0.04] transition-colors"
            >
              {collapsed ? <ChevronRight className="size-3.5" /> : (
                <>
                  <ChevronLeft className="size-3.5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
