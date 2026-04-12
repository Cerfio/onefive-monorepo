import { routing } from "@/i18n/routing";

type Page = {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

const pages: Page[] = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/press', priority: 0.8, changefreq: 'weekly' },
];

export async function GET() {
  const baseUrl = 'https://onefive.app';
  const currentDate = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${pages.map(page => 
        routing.locales.map(locale => `
          <url>
            <loc>${baseUrl}/${locale}${page.path}</loc>
            <lastmod>${currentDate}</lastmod>
            <changefreq>${page.changefreq}</changefreq>
            <priority>${page.priority}</priority>
            ${routing.locales.map(altLocale => `
              <xhtml:link 
                rel="alternate" 
                hreflang="${altLocale}" 
                href="${baseUrl}/${altLocale}${page.path}"
              />`).join('')}
          </url>
        `).join('')
      ).join('')}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
