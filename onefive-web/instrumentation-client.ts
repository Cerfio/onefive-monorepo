import * as Sentry from '@sentry/nextjs';

// Init Sentry côté client. Chargé nativement par Next.js (>=15.3) via ce
// fichier. No-op tant que NEXT_PUBLIC_SENTRY_DSN n'est pas configuré.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
  });
}

// Instrumentation des transitions de route (navigation) côté client.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
