'use client';

import React from 'react';
import { BarChart3, CheckCircle2, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import { useSetting, useUpdateSetting } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';

/**
 * Analytics & Tracking — single home for:
 *   1. Trackers          → GA4 + GTM container IDs
 *   2. Verification      → Search Console ownership tag
 *
 * Backend storage is split across two settings keys (we save to both on
 * Save all): tracker IDs live under `analytics`; the Search Console
 * verification value lives under `seo` alongside the other site-wide SEO
 * fields.
 */

type Analytics = {
  ga4Id: string;
  gtmId: string;
};

const DEFAULT_ANALYTICS: Analytics = {
  ga4Id: '',
  gtmId: '',
};

/** Subset of the `seo` setting that this page can edit. */
type SeoVerification = {
  searchConsoleVerification: string;
};

const DEFAULT_VERIFICATION: SeoVerification = {
  searchConsoleVerification: '',
};

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useSetting<Analytics>('analytics');
  const { data: seoData, isLoading: seoLoading } = useSetting<Record<string, unknown>>('seo');
  const update = useUpdateSetting();
  const { toast } = useToast();

  const [draft, setDraft] = React.useState<Analytics>(DEFAULT_ANALYTICS);
  const [verifDraft, setVerifDraft] = React.useState<SeoVerification>(DEFAULT_VERIFICATION);
  const [dirty, setDirty] = React.useState(false);
  const [verifDirty, setVerifDirty] = React.useState(false);

  React.useEffect(() => {
    if (analyticsData) {
      setDraft({ ...DEFAULT_ANALYTICS, ...analyticsData });
      setDirty(false);
    }
  }, [analyticsData]);

  React.useEffect(() => {
    if (seoData) {
      const current = (seoData as { searchConsoleVerification?: string }).searchConsoleVerification ?? '';
      setVerifDraft({ searchConsoleVerification: current });
      setVerifDirty(false);
    }
  }, [seoData]);

  const set = (k: keyof Analytics, v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  // Search Console offers the verification as a full meta tag — accept either
  // that tag or the bare token by extracting the content value.
  const setVerif = (k: keyof SeoVerification, v: string) => {
    const token = v.match(/content=["']([^"']+)["']/i)?.[1] ?? v;
    setVerifDraft((d) => ({ ...d, [k]: token }));
    setVerifDirty(true);
  };

  const anyDirty = dirty || verifDirty;
  const isLoading = analyticsLoading || seoLoading;

  const save = async () => {
    try {
      const tasks: Promise<unknown>[] = [];
      if (dirty) {
        // Merge our tracker/script fields onto whatever else is stored under
        // `analytics` so we don't blow away fields we don't render here.
        tasks.push(
          update.mutateAsync({
            key: 'analytics',
            value: { ...(analyticsData ?? {}), ...draft },
          })
        );
      }
      if (verifDirty) {
        tasks.push(
          update.mutateAsync({
            key: 'seo',
            value: { ...(seoData ?? {}), ...verifDraft },
          })
        );
      }
      if (tasks.length === 0) return;
      await Promise.all(tasks);
      setDirty(false);
      setVerifDirty(false);
      toast({ title: 'Saved', variant: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analytics & Tracking"
        actions={
          <Button size="sm" onClick={save} disabled={!anyDirty || update.isPending}>
            {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {update.isPending ? 'Saving…' : 'Save all'}
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-spay-lg" />
      ) : (
        <Tabs defaultValue="trackers">
          <TabsList>
            <TabsTrigger value="trackers"><BarChart3 className="size-3.5" />Trackers</TabsTrigger>
            <TabsTrigger value="verification"><ShieldCheck className="size-3.5" />Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="trackers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics 4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor="ga4">Measurement ID</Label>
                    <Input id="ga4" className="mt-1.5 font-mono" placeholder="G-XXXXXXXXXX" value={draft.ga4Id} onChange={(e) => set('ga4Id', e.target.value)} />
                  </div>
                  <Badge variant={draft.ga4Id ? 'success' : 'default'} size="md">
                    {draft.ga4Id && <CheckCircle2 className="size-2.5" />}
                    {draft.ga4Id ? 'Active' : 'Not set'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Tag Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor="gtm">Container ID</Label>
                    <Input id="gtm" className="mt-1.5 font-mono" placeholder="GTM-XXXXXXX" value={draft.gtmId} onChange={(e) => set('gtmId', e.target.value)} />
                  </div>
                  <Badge variant={draft.gtmId ? 'success' : 'default'} size="md">
                    {draft.gtmId && <CheckCircle2 className="size-2.5" />}
                    {draft.gtmId ? 'Connected' : 'Not set'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search engine verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="search-console">Google Search Console</Label>
                  <Input
                    id="search-console"
                    className="mt-1.5 font-mono"
                    value={verifDraft.searchConsoleVerification}
                    onChange={(e) => setVerif('searchConsoleVerification', e.target.value)}
                    placeholder="Token or full <meta> tag, e.g. abc123…"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}
