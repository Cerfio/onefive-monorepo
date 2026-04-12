'use client';

import { Button } from '@/components/base/buttons/button';
import { AlertTriangle } from '@untitledui/icons';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <FeaturedIcon color="error" theme="light" icon={AlertTriangle} size="lg" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-primary">Une erreur est survenue</h2>
        <p className="mt-1 max-w-md text-sm text-tertiary">
          {error.message || "Une erreur inattendue s'est produite."}
        </p>
      </div>
      <Button color="primary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
