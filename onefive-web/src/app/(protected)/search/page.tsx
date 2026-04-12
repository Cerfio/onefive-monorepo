'use client';

import { Suspense } from 'react';
import { SearchPageContent } from './components/SearchPageContent';
import Navbar from '@/components/navbar';

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageContent />
      </Suspense>
    </>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-tertiary rounded animate-pulse" />
          <div className="h-4 w-32 bg-tertiary rounded animate-pulse mt-2" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 bg-tertiary rounded animate-pulse" />
          ))}
        </div>

        {/* Results skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              <div className="h-12 w-12 bg-tertiary rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-tertiary rounded animate-pulse" />
                <div className="h-3 w-48 bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
