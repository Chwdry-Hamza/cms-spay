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
            refetchOnMount: false,
            // Revisits within 5 minutes serve straight from cache (no skeleton,
            // no roundtrip). Cached data is kept around for 30 minutes after
            // last use, so quick switches between Pages/Posts/Categories etc.
            // never have to refetch.
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
