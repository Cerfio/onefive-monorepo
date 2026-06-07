import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getWebOrigin, shouldProxyToWeb } from './lib/onefive-gateway';

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
      if (webOrigin) {
        const target = new URL(
          `${request.nextUrl.pathname}${request.nextUrl.search}`,
          webOrigin,
        );
        return NextResponse.rewrite(target);
      }
    }
    return NextResponse.next();
  }

  if (shouldProxyToWeb(request)) {
    const webOrigin = getWebOrigin();
    if (webOrigin) {
      const target = new URL(
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
        webOrigin,
      );
      return NextResponse.rewrite(target);
    }
  }

  return createMiddleware({
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    localePrefix: 'always',
  })(request);
}

export const config = {
  // Run on app routes and on /_next assets (excluded from the dot rule below).
  matcher: ['/_next/:path*', '/((?!api|_vercel|.*\\..*).*)'],
}; 