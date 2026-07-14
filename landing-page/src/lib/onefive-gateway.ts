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

// Public app content (profiles, posts, startups, spotlights, discussions) must be
// reachable by logged-out visitors AND search-engine crawlers — otherwise the
// whole public SEO surface 404s. The trailing slash is required so we only proxy
// the item pages (e.g. /spotlight/<id>) and never the landing's own /spotlight index.
const WEB_PUBLIC_PREFIXES = [
  '/profile/',
  '/post/',
  '/startup/',
  '/spotlight/',
  '/discussion/',
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

function isWebPublicRoute(pathname: string): boolean {
  return WEB_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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
  // Public content pages must be served (and crawlable) even without an auth cookie.
  if (isWebPublicRoute(pathname)) return true;

  // Authenticated users: proxy app routes (/feed, /profile, /post/…) to onefive-web.
  // Non-authenticated: let landing page handle everything (next-intl will locale-prefix
  // /about, /blog, /terms, etc. — they are landing routes served without locale prefix).
  return hasAuthCookie(request);
}
