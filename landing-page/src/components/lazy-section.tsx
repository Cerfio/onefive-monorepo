"use client";

import { useInView } from "react-intersection-observer";
import { Suspense, lazy, ReactNode } from "react";

// Composant de fallback pendant le chargement
const SectionFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function LazySection({
  children,
  fallback = <SectionFallback />,
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = "50px"
}: LazySectionProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        <div className="min-h-[200px]" /> // Espace réservé pour éviter le layout shift
      )}
    </div>
  );
}

// Hook personnalisé pour charger des composants lazy
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(importFn);
}

