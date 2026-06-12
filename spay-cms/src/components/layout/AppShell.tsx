'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { Toaster } from '@/components/ui/Toaster';
import { useAuth } from '@/lib/auth-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  const isLogin = pathname === '/login' || pathname === '/login/';

  // Redirect unauthenticated users to /login (except already on /login)
  React.useEffect(() => {
    if (!ready) return;
    if (!user && !isLogin) {
      router.replace('/login?next=' + encodeURIComponent(pathname));
    }
  }, [ready, user, isLogin, pathname, router]);

  // ⌘K command palette
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Login page: no chrome
  if (isLogin) {
    return <Toaster><main className="min-h-screen bg-surface-deepest text-fg-1">{children}</main></Toaster>;
  }

  // Still loading auth state OR redirecting
  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-deepest">
        <div className="flex flex-col items-center gap-3 text-fg-3">
          <div className="size-8 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-[0.18em]">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <Toaster>
      {/*
        Viewport-locked shell.
        - `h-dvh` = dynamic viewport height; respects mobile URL bar, zoom,
          and any other UA-chrome that changes height.
        - Topbar is shrink-0 so it never compresses.
        - Main is the only y-scroll region — keeps the topbar pinned no matter
          what the page does, and stops accidental double scrollbars when a
          child uses `h-full` (e.g. ContentEditor).
      */}
      <div className="h-dvh flex bg-surface-deepest text-fg-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex shrink-0 h-full">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
          />
        </div>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative animate-in slide-in-from-left duration-200 h-full">
              <Sidebar
                collapsed={false}
                onToggleCollapsed={() => {}}
                mobile
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <Topbar
            onOpenCommandPalette={() => setCmdOpen(true)}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />
          {/* List pages scroll inside main; the editor uses h-full and
              owns its own internal scrollers. */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">{children}</main>
        </div>

        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>
    </Toaster>
  );
}

// Reusable PageHeader for individual pages
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="font-display font-bold text-[clamp(1.4rem,1rem+1.2vw,1.75rem)] tracking-[-0.02em] text-fg-1 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-fg-3 max-w-2xl">{description}</p>
        )}
      </div>
      {/* On phones, action buttons spill over horizontally rather than wrapping
          into multiple lines — keeps the header height predictable. */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 -mx-1 px-1 overflow-x-auto sm:overflow-visible">
          {actions}
        </div>
      )}
    </div>
  );
}

// Page wrapper for consistent padding
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1480px] mx-auto ${className ?? ''}`}>
      {children}
    </div>
  );
}
