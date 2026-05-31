'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LABEL_MAP: Record<string, string> = {
  '': 'Dashboard',
  pages: 'Pages',
  posts: 'Blog Posts',
  categories: 'Categories',
  media: 'Media Library',
  redirects: 'Redirects',
  seo: 'SEO Settings',
  sitemap: 'Sitemap',
  'logs-404': '404 Logs',
  analytics: 'Analytics Settings',
  new: 'New',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  // No root "Spay CMS" crumb — the sidebar logo + Dashboard link cover that role.
  const crumbs: { label: string; href: string }[] = [];
  let acc = '';
  parts.forEach((seg) => {
    acc += '/' + seg;
    crumbs.push({ label: LABEL_MAP[seg] ?? decodeURIComponent(seg), href: acc });
  });
  // On the dashboard root, show a single "Dashboard" label.
  if (crumbs.length === 0) crumbs.push({ label: 'Dashboard', href: '/' });

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm min-w-0', className)}>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={c.href + i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="size-3.5 text-fg-4 shrink-0" />}
            {isLast ? (
              <span className="font-medium text-fg-1 truncate">{c.label}</span>
            ) : (
              <Link
                href={c.href}
                className="text-fg-3 hover:text-fg-1 transition-colors truncate"
              >
                {c.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
