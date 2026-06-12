'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Image as ImageIcon, AlertOctagon, Activity,
  ArrowRight, NotebookPen,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStats } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { formatNumber, relativeTime, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useStats();

  const firstName = user?.email?.split('@')[0]?.split('.')[0] ?? 'there';
  const greeting = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const stats = [
    { label: 'Total pages', value: data?.pages.total ?? 0,        icon: FileText,    accent: 'cyan' },
    { label: 'Total posts', value: data?.posts.total ?? 0,         icon: NotebookPen, accent: 'success' },
    { label: 'Media items', value: data?.media.total ?? 0,         icon: ImageIcon,   accent: 'cyan' },
    { label: '404 errors',  value: data?.logs404.unresolved ?? 0,  icon: AlertOctagon, accent: 'warning' },
  ];

  const accentMap = {
    cyan:    { bg: 'bg-cyan-300/10',   text: 'text-cyan-300',   border: 'border-cyan-300/20' },
    success: { bg: 'bg-success/10',    text: 'text-success',    border: 'border-success/20' },
    warning: { bg: 'bg-warning/10',    text: 'text-warning',    border: 'border-warning/20' },
  } as const;

  return (
    <PageContainer>
      <PageHeader title={`Good morning, ${greeting}`} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const a = accentMap[s.accent as keyof typeof accentMap];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="spay-card-hover relative overflow-hidden">
                <CardContent className="relative pt-6 pb-5">
                  <div className="mb-3">
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-spay-md border ${a.border} ${a.bg} ${a.text}`}>
                      <s.icon className="size-4" />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mb-2" />
                  ) : (
                    <p className="font-display font-bold text-[28px] leading-none text-fg-1 tracking-[-0.02em]">
                      {typeof s.value === 'number' ? formatNumber(s.value) : s.value}
                    </p>
                  )}
                  <p className="text-xs text-fg-3 mt-2">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent pages */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent pages</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pages">View all <ArrowRight /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isLoading ? (
              <ul className="divide-y divide-line">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="px-6 py-3 flex items-center gap-4">
                    <Skeleton className="size-9 rounded-spay-md" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
                  </li>
                ))}
              </ul>
            ) : (data?.recent?.pages?.length ?? 0) === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-fg-3">No pages yet.</div>
            ) : (
              <ul className="divide-y divide-line">
                {data!.recent.pages.map((p: any) => (
                  <li key={p._id} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="size-9 rounded-spay-md bg-cyan-300/5 border border-line flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-cyan-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/pages/edit?id=${p._id}`} className="font-medium text-sm text-fg-1 hover:text-cyan-300 transition-colors truncate block">
                        {p.title}
                      </Link>
                    </div>
                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <StatusBadge status={p.status} />
                      <span className="text-[11px] text-fg-4 mt-1">{relativeTime(p.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* SEO health */}
        <Card>
          <CardHeader>
            <CardTitle>SEO health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-bold text-[40px] leading-none text-fg-1 tracking-[-0.02em]">
                {data?.seoHealth?.score ?? 0}
              </span>
              <span className="text-sm text-fg-3">/ 100</span>
            </div>
            <Progress value={data?.seoHealth?.score ?? 0} className="mb-5" />
            <div className="space-y-3">
              {(() => {
                const sh = data?.seoHealth;
                const colorFor = (v: number) => v >= 80 ? 'success' : v >= 50 ? 'cyan-300' : 'warning';
                const rows = [
                  { label: 'Pages & posts with meta description', value: sh?.metaDescription ?? 0 },
                  { label: 'Images with alt text',                value: sh?.altText         ?? 0 },
                  { label: 'Pages & posts with H1',               value: sh?.h1              ?? 0 },
                  { label: 'Pages & posts with internal links',   value: sh?.internalLinks   ?? 0 },
                ];
                return rows.map((c) => {
                  const color = colorFor(c.value);
                  return (
                    <div key={c.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-fg-3">{c.label}</span>
                        <span className="font-mono font-semibold text-fg-1">{c.value}%</span>
                      </div>
                      <Progress value={c.value} indicatorClassName={
                        color === 'success' ? 'bg-success' :
                        color === 'warning' ? 'bg-warning' : 'bg-cyan-300'
                      } />
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Latest posts */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Latest blog posts</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/posts">View all <ArrowRight /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-spay-md border border-line bg-surface/40 overflow-hidden">
                    <Skeleton className="aspect-[16/9] w-full rounded-none" />
                    <div className="p-3 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-full" /></div>
                  </div>
                ))}
              </div>
            ) : (data?.recent?.posts?.length ?? 0) === 0 ? (
              <div className="py-8 text-center text-sm text-fg-3">No posts yet — <Link href="/posts/new" className="text-cyan-300 hover:underline">write the first one</Link></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {data!.recent.posts.map((p: any) => (
                  <Link key={p._id} href={`/posts/edit?id=${p._id}`} className="spay-card-hover group rounded-spay-md border border-line bg-surface/40 overflow-hidden block">
                    <div className="aspect-[16/9] relative overflow-hidden">
                      {p.cover ? (
                        <img src={p.cover} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/[0.06] to-navy-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                      <div className="absolute top-2 left-2"><StatusBadge status={p.status} /></div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-cyan-300 font-semibold uppercase tracking-[0.12em] mb-1">{p.categoryName}</p>
                      <h3 className="font-display font-semibold text-sm text-fg-1 leading-snug mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-fg-4">
                        <span>{formatDate(p.publishedAt || p.updatedAt)}</span>
                        <span aria-hidden>·</span>
                        <span>{p.readTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
