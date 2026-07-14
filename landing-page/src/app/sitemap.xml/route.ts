import { SITE_URL } from "@/lib/site";

// Regenerate on every request so <lastmod> and newly published blog posts are
// reflected without a redeploy (the route was previously frozen at build time).
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = SITE_URL;
  const currentDate = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemaps/pages</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemaps/blog</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
