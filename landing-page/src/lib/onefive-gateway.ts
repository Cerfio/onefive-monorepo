import type { NextRequest } from 'next/server';

/** Vercel deployment origin for onefive-web (no trailing slash). */
export function getWebOrigin(): string | undefined {
  const origin = process.env.ONEFIVE_WEB_ORIGIN?.trim();
  if (!origin) return undefined;
  return origin.replace(/\/$/, '');
}

const LOCALE_PREFIX = /^\/(en|fr)(\/|$)/;
const LANDING_API_PREFIX = /^\/api(\/|$)/;
const INGEST_PREFIX = /^\/ingest(\/|$)/;

const WEB_ALWAYS_PREFIXES = [
  '/signin',
  '/signup',
  '/onboarding',
  '/auth',
  '/waitlist',
] as const;

export function hasAuthCookie(request: NextRequest): boolean {
  return (
    request.cookies.get('is_authenticated')?.value === '1' ||
    Boolean(request.cookies.get('token')?.value)
  );
}

export function isLandingRoute(pathname: string): boolean {
  if (INGEST_PREFIX.test(pathname)) return true;
  if (LANDING_API_PREFIX.test(pathname)) return true;
  if (LOCALE_PREFIX.test(pathname)) return true;
  return false;
}

function isWebAlwaysRoute(pathname: string): boolean {
  return WEB_ALWAYS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function refererPath(request: NextRequest): string | null {
  const referer = request.headers.get('referer');
  if (!referer) return null;
  try {
    return new URL(referer).pathname;
  } catch {
    return null;
  }
}

function shouldProxyNextAsset(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/_next/')) return false;
  if (!hasAuthCookie(request)) return false;

  const from = refererPath(request);
  if (from && isLandingRoute(from)) return false;

  return true;
}

/** Route HTML/RSC/API traffic to onefive-web behind onefive.app. */
export function shouldProxyToWeb(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;

  if (isLandingRoute(pathname)) return false;
  // /_next assets: only proxy to web when authenticated and coming from a web page.
  // Without this guard the landing page's own CSS/JS would be forwarded to onefive-web.
  if (pathname.startsWith('/_next/')) return shouldProxyNextAsset(request);
  if (pathname === '/') return hasAuthCookie(request);
  if (isWebAlwaysRoute(pathname)) return true;

  // App routes (/feed, /profile, /post/..., etc.) always hit onefive-web.
  return true;
}
