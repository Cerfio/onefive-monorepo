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