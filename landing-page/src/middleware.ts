import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {
  getWebOrigin,
  resolveWebTarget,
  shouldProxyToWeb,
} from './lib/onefive-gateway';
import { routing } from './i18n/routing';

// Falling through to next-intl when ONEFIVE_WEB_ORIGIN is missing is silent and
// total: /profile, /post, /startup, /spotlight/<id> and /discussion stop being
// proxied, get locale-prefixed, and 404 — the app's entire public surface, with
// nothing in the logs. That is the failure 2c1063d fixed; it should not be able
// to come back through an unset variable. Logged once per cold start rather
// than per request.
let warnedMissingOrigin = false;
function warnMissingWebOrigin(pathname: string) {
  if (warnedMissingOrigin) return;
  warnedMissingOrigin = true;
  console.error(
    `[gateway] ONEFIVE_WEB_ORIGIN is unset — "${pathname}" should proxy to ` +
      'onefive-web but will be served by the landing page and 404. Set it in ' +
      'the Vercel project environment.',
  );
}

export default function middleware(request: NextRequest) {
  // PostHog proxy: Safari (and others) may send OPTIONS preflight for /ingest.
  // Reply 204 so the actual POST can proceed; other methods fall through to rewrites.
  if (request.nextUrl.pathname.startsWith('/ingest')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    return NextResponse.next();
  }

  // /_next/* assets: either proxy to onefive-web (authenticated) or let Next.js
  // serve the landing page's own static files directly — never pass through
  // next-intl which would prepend a locale prefix and cause a 307 redirect loop.
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    if (shouldProxyToWeb(request)) {
      const webOrigin = getWebOrigin();
      if (!webOrigin) {
        warnMissingWebOrigin(request.nextUrl.pathname);
      } else {
        const target = resolveWebTarget(
          request.nextUrl.pathname,
          request.nextUrl.search,
          webOrigin,
        );
        if (target) return NextResponse.rewrite(target);
      }
    }
    return NextResponse.next();
  }

  if (shouldProxyToWeb(request)) {
    const webOrigin = getWebOrigin();
    if (!webOrigin) {
      warnMissingWebOrigin(request.nextUrl.pathname);
    } else {
      const target = resolveWebTarget(
        request.nextUrl.pathname,
        request.nextUrl.search,
        webOrigin,
      );
      if (target) return NextResponse.rewrite(target);
      // Resolved off-origin: the path is not ours to proxy. Fall through to the
      // landing, which will 404 it.
    }
  }

  // Single source of truth: locales + defaultLocale + localePrefix live in
  // src/i18n/routing.ts (they were previously duplicated here and diverged).
  return createMiddleware(routing)(request);
}

export const config = {
  // Run on app routes and on /_next assets (excluded from the dot rule below).
  // `sitemaps` is excluded so /sitemaps/:type reaches its route handler instead
  // of being locale-prefixed by next-intl (which 404'd every child sitemap).
  // `studio-9k4x2m` + `payload-api` are the embedded Payload CMS: they must be
  // served by this app directly — never locale-prefixed, never proxied to
  // onefive-web. Keep in sync with `routes` in src/payload.config.ts.
  matcher: [
    '/_next/:path*',
    '/((?!api|payload-api|studio-9k4x2m|_vercel|sitemaps|.*\\..*).*)',
  ],
}; 