import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  eslint: {
    ignoreDuringBuilds: true,
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
      {
        protocol: 'https',
        hostname: '**.onefive.app**',
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
      // Redirection favicon.ico vers le PNG si problème avec ICO
      {
        source: '/favicon.ico',
        destination: '/favicon-32x32.png',
        permanent: false, // temporaire pour tester
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
    ];
  },
};

export default withNextIntl(nextConfig);
