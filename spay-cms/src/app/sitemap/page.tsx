'use client';

import React from 'react';
import { Code2, Network, Globe, Save, Loader2, ExternalLink, RotateCcw, FileText, Newspaper, Layers, Folder } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import { useSetting, useUpdateSetting } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';

/**
 * Safe defaults — synced with the website's dynamic generator at
 * spay-website-next/src/app/robots.txt/route.ts.
 */
const SAFE_DEFAULT_ROBOTS = `# robots.txt for spay.finance
# Edit freely — saved value is served verbatim. Reset to revert to this baseline.

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://spay.finance/sitemap.xml
`;

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const SUB_SITEMAPS: { name: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'sitemap.xml',            label: 'Sitemap index', icon: Layers },
  { name: 'sitemap-static.xml',     label: 'Static URLs',    icon: Globe },
  { name: 'sitemap-pages.xml',      label: 'Pages',          icon: FileText },
  { name: 'sitemap-posts.xml',      label: 'Posts',          icon: Newspaper },
  { name: 'sitemap-categories.xml', label: 'Categories',     icon: Folder },
];

function SitemapPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sitemap files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {SUB_SITEMAPS.map((s) => (
          <a key={s.name} href={`${SITE_ORIGIN}/${s.name}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-spay-md border border-line bg-surface/40 hover:bg-surface transition-colors">
            <div className="size-9 rounded-spay-md bg-cyan-300/[0.05] border border-cyan-300/15 flex items-center justify-center shrink-0">
              <s.icon className="size-4 text-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-semibold text-fg-1">{s.name}</p>
            </div>
            <ExternalLink className="size-3.5 text-fg-4" />
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SitemapPage() {
  const robotsQuery = useSetting<string>('robots');
  const update = useUpdateSetting();
  const { toast } = useToast();
  const [robots, setRobots] = React.useState<string>('');
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (robotsQuery.data !== undefined && robotsQuery.data !== null) {
      setRobots(typeof robotsQuery.data === 'string' ? robotsQuery.data : '');
      setDirty(false);
    }
  }, [robotsQuery.data]);

  const isCustom = robots.trim().length > 0;

  const saveRobots = async () => {
    try {
      await update.mutateAsync({ key: 'robots', value: robots });
      setDirty(false);
      toast({ title: 'robots.txt saved', variant: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  const clearOverride = async () => {
    try {
      await update.mutateAsync({ key: 'robots', value: '' });
      setRobots('');
      setDirty(false);
      toast({ title: 'Reverted to dynamic robots.txt', variant: 'success' });
    } catch (err) {
      toast({ title: 'Clear failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Sitemap & indexing" />

      <Tabs defaultValue="sitemap">
        <TabsList>
          <TabsTrigger value="sitemap"><Network className="size-3.5" />Sitemap</TabsTrigger>
          <TabsTrigger value="robots"><Code2 className="size-3.5" />Robots.txt</TabsTrigger>
        </TabsList>

        <TabsContent value="sitemap" className="space-y-4">
          <SitemapPanel />
        </TabsContent>

        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>robots.txt {isCustom && <Badge variant="cyan" size="sm" className="ml-2">manual override</Badge>}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="http://localhost:3000/robots.txt" target="_blank" rel="noopener noreferrer">
                    <ExternalLink />View live
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {robotsQuery.isLoading ? (
                <Skeleton className="h-[360px] w-full rounded-spay-md" />
              ) : (
                <div className="rounded-spay-md border border-line bg-surface-deepest overflow-hidden">
                  <div className="px-4 py-2 border-b border-line bg-surface/40 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-4">robots.txt</span>
                    <span className="text-[10px] font-mono text-fg-4">{(robots || '').split('\n').length} lines · {(robots || '').length} chars</span>
                  </div>
                  <textarea
                    value={robots}
                    onChange={(e) => { setRobots(e.target.value); setDirty(true); }}
                    spellCheck={false}
                    placeholder="# Paste a robots.txt or click 'Use safe defaults' below to start from a baseline"
                    className="w-full h-[360px] p-4 bg-transparent font-mono text-xs text-fg-1 placeholder:text-fg-4 outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setRobots(SAFE_DEFAULT_ROBOTS); setDirty(true); }}>
                    <RotateCcw />Use safe defaults
                  </Button>
                  {isCustom && (
                    <Button variant="ghost" size="sm" className="text-fg-3 hover:text-fg-1" onClick={clearOverride} disabled={update.isPending}>
                      Revert to auto
                    </Button>
                  )}
                </div>
                <Button size="sm" disabled={!dirty || update.isPending} onClick={saveRobots}>
                  {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  Save robots.txt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
