import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://onefive.app/sitemap.xml
Sitemap: https://www.onefive.app/sitemap.xml

# Localized paths  
Allow: /fr
Allow: /en
Allow: /fr/*
Allow: /en/*

# Important: Allow favicon access for all crawlers
Allow: /favicon.ico
Allow: /favicon-*.png
Allow: /app-icon.png

# Common paths to allow
Allow: /fr/blog
Allow: /en/blog
Allow: /fr/about
Allow: /en/about

# Prevent indexing of API routes
Disallow: /api/
Disallow: /_next/
Disallow: /*?

# Media and assets
Allow: /*.js
Allow: /*.css
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.ico

# Crawl delay for better server performance
Crawl-delay: 1

# Google specific
User-agent: Googlebot
Allow: /
Allow: /favicon.ico
Allow: /favicon-*.png
Crawl-delay: 1

# Bing specific
User-agent: Bingbot
Allow: /
Allow: /favicon.ico
Allow: /favicon-*.png
Crawl-delay: 1

# Block common crawlers that might cause issues
User-agent: AdsBot-Google
Allow: /
Allow: /favicon.ico

User-agent: Mediapartners-Google
Allow: /
Allow: /favicon.ico

# Block archive.org bot
User-agent: ia_archiver
Disallow: /

# Block chat GPT bot
User-agent: GPTBot
Disallow: /

# Block Common Bot Abuse Patterns
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*query=`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600', // 1 heure de cache
    },
  });
} 