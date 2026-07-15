import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

const withNextIntl = createNextIntlPlugin();

// Baseline security headers applied to every response.
// NB: no Content-Security-Policy here on purpose — a strict CSP needs to be
// authored and tested against PostHog, Mapbox, next inline scripts and the
// JSON-LD <script> tags, so it's deferred rather than shipped blind and broken.
// HSTS is intentionally omitted too: Vercel already sends it on this domain.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Payload's server-side CLI tooling has optional peer deps (cli-color) that are
  // missing at build time — keep it external so Next doesn't try to bundle it.
  serverExternalPackages: ["json-schema-to-typescript"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // clx.div/textarea typings are too strict for legacy landing UI components
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      // Was '**.onefive.app**' — the trailing '**' after the TLD made this match
      // arbitrary hosts containing the substring (e.g. x.onefive.app.attacker.com),
      // turning /_next/image into an open proxy (SSRF). Scoped to the real hosts.
      {
        protocol: 'https',
        hostname: 'onefive.app',
      },
      {
        protocol: 'https',
        hostname: '*.onefive.app',
      },
      {
        protocol: 'https',
        hostname: 'www.untitledui.com',
      },
    ],
  },
  async redirects() {
    return [
      // Redirection favicon.png supprimée - fichier direct maintenant disponible
      // Redirections favicon.png pour les locales (avec pattern pour capturer toutes les locales)
      {
        source: '/:locale(fr|en)/favicon.png',
        destination: '/favicon-192x192.png',
        permanent: true,
      },
      // Redirection apple-touch-icon pour les appareils iOS
      {
        source: '/apple-touch-icon.png',
        destination: '/favicon-192x192.png',
        permanent: true,
      },
      // Redirection favicon.ico vers le PNG
      {
        source: '/favicon.ico',
        destination: '/favicon-32x32.png',
        permanent: true,
      },
      // Redirection ancienne URL mediakit → media-kit
      {
        source: '/:locale(fr|en)/mediakit',
        destination: '/:locale/media-kit',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Headers pour les favicons PNG seulement
      {
        source: '/favicon-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
      // Baseline security headers on every route.
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
