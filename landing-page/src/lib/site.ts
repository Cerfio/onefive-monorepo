/**
 * Canonical public origin for the marketing site.
 *
 * Production is served on the `www` host — the apex `onefive.app` issues a 308
 * redirect to it. Every SEO signal (canonical, hreflang, OpenGraph, JSON-LD,
 * sitemaps) MUST therefore use this value, otherwise the signals point at a URL
 * that redirects, which Google penalises. The apex→www redirect is also
 * enforced at the Cloudflare DNS level.
 */
export const SITE_URL = "https://www.onefive.app";

/** Absolute URL for a locale-prefixed path, e.g. absoluteUrl("en", "/blog"). */
export function absoluteUrl(locale: string, path = ""): string {
  const clean = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${SITE_URL}/${locale}${clean}`;
}
