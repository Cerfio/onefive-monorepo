import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/startup/',
          '/profile/',
          '/discussion/',
          '/discussions/',
          '/spotlight/',
          '/feed/',
        ],
        disallow: [
          '/feed',
          '/messages',
          '/settings',
          '/dataroom/',
          '/analytics',
          '/network',
          '/search',
          '/onboarding',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_URL_PUBLIC || 'https://www.onefive.app'}/sitemap.xml`,
  };
}
