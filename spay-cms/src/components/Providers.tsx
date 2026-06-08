'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            // Refetch on mount only when the cached data is stale. Unchanged
            // sections stay instant within the 5-min staleTime window, but a
            // list that a mutation marked stale (e.g. after creating/saving a
            // post) refetches the moment you navigate back to it — so new rows
            // appear immediately without a manual reload. (Leaving this `false`
            // suppressed that refetch, which is why edits only showed up after
            // a hard reload.)
            refetchOnMount: true,
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
