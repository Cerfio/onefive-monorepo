import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*query=

# archive.org crawler (intentionally blocked)
User-agent: ia_archiver
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600', // 1 heure de cache
    },
  });
}
