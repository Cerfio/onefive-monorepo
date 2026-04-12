'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (e.g., Sentry)
    if (process.env.NODE_ENV !== 'production') {
      // Only log in development
      console.error('Application Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Nous nous excusons pour ce désagrément
            </p>
          </div>
        </div>

        {error.message && process.env.NODE_ENV !== 'production' && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs font-mono text-gray-700 break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2"
            variant="default"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="flex-1 inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Si le problème persiste, veuillez contacter le support.
        </p>
      </div>
    </div>
  );
}
