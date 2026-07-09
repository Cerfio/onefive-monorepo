'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Remonter à Sentry (no-op si le DSN n'est pas configuré).
    Sentry.captureException(error);
    if (process.env.NODE_ENV !== 'production') {
      console.error('Global Error:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">
                  Erreur critique
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  L'application a rencontré une erreur critique
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

            <button
              onClick={reset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>

            <p className="text-xs text-gray-500 text-center">
              Si le problème persiste, veuillez contacter le support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
