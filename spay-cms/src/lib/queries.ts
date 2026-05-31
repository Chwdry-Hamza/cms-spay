'use client';

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api } from './api';

/**
 * Warm the React-Query cache for whichever section the user is about to open.
 * Wired to onMouseEnter / onFocus on the sidebar links so that by the time the
 * click lands, the listing data is already in-flight (or even resolved). The
 * defaults set in Providers.tsx (5 min staleTime) mean repeat hovers don't
 * re-fetch.
 */
export function prefetchForRoute(qc: QueryClient, href: string): void {
  const fetchOnce = <T,>(key: unknown[], url: string, params?: Record<string, unknown>) =>
    qc.prefetchQuery({
      queryKey: key,
      queryFn: () => api.get<T>(url, params ? { params } : undefined).then((r) => r.data),
    });

  switch (href) {
    case '/':
      fetchOnce(['stats'], '/api/stats');
      break;
    case '/pages':
      fetchOnce(['pages', { page: 1, limit: 10 }], '/api/pages', { page: 1, limit: 10 });
      break;
    case '/posts':
      fetchOnce(['posts', { page: 1, limit: 10 }], '/api/posts', { page: 1, limit: 10 });
      break;
    case '/categories':
      qc.prefetchQuery({
        queryKey: ['categories'],
        queryFn: () => api.get<{ items: unknown[] }>('/api/categories').then((r) => r.data.items),
      });
      break;
    case '/media':
      qc.prefetchQuery({
        queryKey: ['media', { q: undefined }],
        queryFn: () => api.get<{ items: unknown[] }>('/api/media').then((r) => r.data.items),
      });
      break;
    case '/redirects':
      qc.prefetchQuery({
        queryKey: ['redirects', undefined],
        queryFn: () => api.get<{ items: unknown[] }>('/api/redirects').then((r) => r.data.items),
      });
      break;
    case '/logs-404':
      fetchOnce(['logs-404', false], '/api/logs-404', { hideResolved: '0' });
      break;
    default:
      // /seo, /sitemap, /analytics use settings — cheap to load, skip prefetch.
      break;
  }
}

// ─── Types (mirror the backend shape) ──────────────────────────────
export type ContentStatus = 'draft' | 'published' | 'scheduled';

export type SEO = {
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  nofollow: boolean;
  og: { title: string; description: string; image: string };
  twitter: { card: string; title: string; description: string; image?: string };
};

export type StructuredData = {
  type: 'none' | 'article' | 'faq' | 'service' | 'custom';
  faq: { q: string; a: string }[];
  service: {
    name: string;
    description: string;
    serviceType: string;
    areaServed: string;
    priceRange: string;
  };
  customJsonLd: string;
};

export const emptyStructuredData: StructuredData = {
  type: 'none',
  faq: [],
  service: { name: '', description: '', serviceType: '', areaServed: '', priceRange: '' },
  customJsonLd: '',
};

export type Performance = {
  skipAnalytics: boolean;
  skipCustomScripts: boolean;
  disableCache: boolean;
  lazyLoadImages: boolean;
};

export const emptyPerformance: Performance = {
  skipAnalytics: false,
  skipCustomScripts: false,
  disableCache: false,
  lazyLoadImages: true,
};

export type Page = {
  _id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  template: string;
  content: any;
  excerpt: string;
  seo: SEO;
  schema?: StructuredData;
  performance?: Performance;
  featuredImage?: string | { _id: string; url: string; alt: string; variants?: Record<string, string>; width?: number; height?: number } | null;
  authorName?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt: string;
  content: any;
  cover: string;
  coverMedia?: string | { _id: string; url: string; alt: string; variants?: Record<string, string>; width?: number; height?: number } | null;
  category?: { _id: string; name: string; slug: string; color: string } | string;
  categoryName: string;
  tags: string[];
  seo: SEO;
  schema?: StructuredData;
  performance?: Performance;
  readTime: number;
  authorName?: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategorySEO = {
  title?: string;
  description?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  content?: string;
  seo?: CategorySEO;
  pageSize?: number;
};

export type MediaItem = {
  _id: string;
  name: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mime: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  isWebP: boolean;
  variants: Record<string, string>;
  createdAt: string;
};

export type Redirect = {
  _id: string;
  from: string;
  to: string;
  createdAt: string;
};

export type Log404 = {
  _id: string;
  url: string;
  hits: number;
  lastSeen: string;
  resolved: boolean;
};

export type Paged<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

// ─── Auth ──────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me').then((r) => r.data.user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Stats (dashboard) ─────────────────────────────────────────────
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/stats').then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

// ─── Pages ─────────────────────────────────────────────────────────
export type PageListParams = {
  q?: string; status?: string; sort?: string; page?: number; limit?: number;
};

export function usePages(params: PageListParams = {}) {
  return useQuery({
    queryKey: ['pages', params],
    queryFn: () => api.get<Paged<Page>>('/api/pages', { params }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function usePage(id: string | undefined) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => api.get<Page>(`/api/pages/${id}`).then((r) => r.data),
    enabled: !!id && id !== 'new',
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Page>) => api.post<Page>('/api/pages', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

export function useUpdatePage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Page>) => api.put<Page>(`/api/pages/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
      qc.setQueryData(['page', id], data);
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/pages/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

export function useDuplicatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/pages/${id}/duplicate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

// ─── Posts ─────────────────────────────────────────────────────────
export type PostListParams = PageListParams & { category?: string };

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.get<Paged<Post>>('/api/posts', { params }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<Post>(`/api/posts/${id}`).then((r) => r.data),
    enabled: !!id && id !== 'new',
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Post>) => api.post<Post>('/api/posts', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Post>) => api.put<Post>(`/api/posts/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
      qc.setQueryData(['post', id], data);
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/posts/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

// ─── Categories ────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ items: Category[] }>('/api/categories').then((r) => r.data.items),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Category>) => api.post<Category>('/api/categories', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Category> & { id: string }) =>
      api.put<Category>(`/api/categories/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['sitemap'] });
    },
  });
}

// ─── Media ─────────────────────────────────────────────────────────
export function useMedia(filter: { q?: string; type?: string } = {}) {
  return useQuery({
    queryKey: ['media', filter],
    queryFn: () => api.get<{ items: MediaItem[] }>('/api/media', { params: filter }).then((r) => r.data.items),
    placeholderData: (prev) => prev,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const res = await api.post<{ items: MediaItem[] }>('/api/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.items;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<MediaItem> & { id: string }) =>
      api.patch<MediaItem>(`/api/media/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/media/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

// ─── Media usage (who references this file) ───────────────────────
export type MediaUsageRef = {
  type: 'page' | 'post';
  id: string;
  title: string;
  slug: string;
  via: 'featured' | 'cover';
};

export function useMediaUsage(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['media-usage', id],
    queryFn: () => api.get<{ total: number; items: MediaUsageRef[] }>(`/api/media/${id}/usage`).then((r) => r.data),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

// ─── Redirects ─────────────────────────────────────────────────────
export function useRedirects(q?: string) {
  return useQuery({
    queryKey: ['redirects', q],
    queryFn: () => api.get<{ items: Redirect[] }>('/api/redirects', { params: q ? { q } : {} }).then((r) => r.data.items),
    placeholderData: (prev) => prev,
  });
}

export function useCreateRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Redirect>) => api.post<Redirect>('/api/redirects', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['redirects'] }),
  });
}

export function useUpdateRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Redirect> & { id: string }) =>
      api.put<Redirect>(`/api/redirects/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['redirects'] }),
  });
}

export type BulkRedirectRow = {
  from: string;
  to: string;
};

export type BulkRedirectResult = {
  ok: boolean;
  summary: { received: number; created: number; updated: number; skipped: number; errors: number };
  errors: { row: number; from: string; reason: string }[];
};

export function useBulkCreateRedirects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rows: BulkRedirectRow[]; conflictStrategy: 'skip' | 'update' }) =>
      api.post<BulkRedirectResult>('/api/redirects/bulk', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['redirects'] }),
  });
}

export function useDeleteRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/redirects/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['redirects'] }),
  });
}

// ─── 404 Logs ──────────────────────────────────────────────────────
export function useLogs404(hideResolved = true) {
  return useQuery({
    queryKey: ['logs-404', hideResolved],
    queryFn: () => api.get<{ items: Log404[] }>(
      '/api/logs-404', { params: { hideResolved: hideResolved ? '1' : '0' } }
    ).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useResolveLog404() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      api.patch(`/api/logs-404/${id}`, { resolved }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs-404'] }),
  });
}

export function useDeleteLog404() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/logs-404/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['logs-404'] }),
  });
}

// ─── Settings (key/value) ──────────────────────────────────────────
export function useSetting<T = any>(key: string) {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: () => api.get<T>(`/api/settings/${key}`).then((r) => r.data),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      api.put(`/api/settings/${key}`, value).then((r) => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['setting', vars.key] }),
  });
}

// ─── Internal-linking suggestions ──────────────────────────────────
export type Suggestion = {
  kind: 'page' | 'post';
  _id: string;
  title: string;
  slug: string;
  url: string;
  excerpt?: string;
  categoryName?: string;
  tags?: string[];
  score: number;
  reasons: string[];
};

type SuggestionParams = {
  excludeId?: string;
  excludeType?: 'page' | 'post';
  category?: string;
  tags?: string[];
  limit?: number;
  enabled?: boolean;
};

export function useSuggestions(params: SuggestionParams = {}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: ['suggestions', rest],
    queryFn: () =>
      api
        .get<{ items: Suggestion[] }>('/api/public/suggestions', {
          params: {
            excludeId: rest.excludeId,
            excludeType: rest.excludeType,
            category: rest.category,
            tags: rest.tags?.join(','),
            limit: rest.limit,
          },
        })
        .then((r) => r.data.items),
    enabled,
    staleTime: 60_000,
  });
}

// ─── Sitemap inspection (for the CMS Sitemap tab) ─────────────────
export type SitemapEntry = { slug: string; title: string; updatedAt: string; publishedAt?: string | null };
export type SitemapExcluded = { slug: string; title: string; reason: 'draft' | 'scheduled' | 'noindex'; updatedAt: string };
export type SitemapSection = { items: SitemapEntry[]; excluded: SitemapExcluded[] };

export function useSitemapPages() {
  return useQuery({
    queryKey: ['sitemap', 'pages'],
    queryFn: () => api.get<SitemapSection>('/api/public/sitemap/pages').then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useSitemapPosts() {
  return useQuery({
    queryKey: ['sitemap', 'posts'],
    queryFn: () => api.get<SitemapSection>('/api/public/sitemap/posts').then((r) => r.data),
    staleTime: 30_000,
  });
}

// ─── Incoming links (who links TO a given page/post) ──────────────
export type IncomingLink = {
  sourceType: 'page' | 'post';
  sourceId: string;
  sourceTitle: string;
  sourceSlug: string;
  anchorTexts: string[];
};

export type IncomingLinksResponse = {
  target: { type: 'page' | 'post'; id: string; slug: string; title: string };
  total: number;
  items: IncomingLink[];
};

export function useIncomingLinks(type: 'page' | 'post', id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['incoming-links', type, id],
    queryFn: () => api.get<IncomingLinksResponse>(`/api/incoming-links/${type}/${id}`).then((r) => r.data),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

// ─── Revisions ─────────────────────────────────────────────────────
export type Revision = {
  _id: string;
  entityType: 'page' | 'post';
  entityId: string;
  label: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
};

export function useRevisions(entityType: 'page' | 'post', entityId: string | undefined) {
  return useQuery({
    queryKey: ['revisions', entityType, entityId],
    queryFn: () =>
      api.get<{ items: Revision[]; total: number }>(`/api/revisions/${entityType}/${entityId}`).then((r) => r.data),
    enabled: !!entityId && entityId !== 'new',
  });
}

export function useRestoreRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (revisionId: string) =>
      api.post(`/api/revisions/${revisionId}/restore`).then((r) => r.data),
    onSuccess: (data: any) => {
      // Invalidate the parent page/post + its revision list
      const entity = data?.restored;
      if (entity?._id) {
        qc.invalidateQueries({ queryKey: ['page', entity._id] });
        qc.invalidateQueries({ queryKey: ['post', entity._id] });
        qc.invalidateQueries({ queryKey: ['pages'] });
        qc.invalidateQueries({ queryKey: ['posts'] });
        qc.invalidateQueries({ queryKey: ['revisions'] });
        qc.invalidateQueries({ queryKey: ['sitemap'] });
      }
    },
  });
}
