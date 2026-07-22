'use client';
import { Toaster } from 'sonner';
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dynamic from 'next/dynamic';
import { RouteProvider } from '@/providers/router-provider';
import { Theme } from '@/providers/theme';
import { PostHogProvider } from '@/providers/PostHogProvider';

const TranslationProvider = dynamic(() => import('./TranslationProvider'), {
  ssr: false,
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [client] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: false,
        },
      },
    }),
  );

  return (
    <PostHogProvider>
      <QueryClientProvider client={client}>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
        <TranslationProvider>
          <RouteProvider>
            <Toaster />
            <Theme>{children}</Theme>
          </RouteProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
};

export default Providers;
