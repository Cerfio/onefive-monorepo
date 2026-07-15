import { routing } from "@/i18n/routing";
import Article from "@/types/article.interface";
import { getArticles } from "@/utils/blog-api";
import { SITE_URL } from "@/lib/site";

// Regenerate on request: picks up newly published posts and keeps <lastmod>
// honest instead of freezing at build time.
export const dynamic = "force-dynamic";

// x-default target — kept as "en" to match the canonical/x-default emitted by
// [locale]/layout.tsx and the HTTP Link header.
const X_DEFAULT_LOCALE = "en";

// Real, public marketing + legal pages (verified to exist). Extend as new
// public routes ship. `priority`/`changefreq` are omitted on purpose — Google
// ignores them.
const pages = [
  "",
  "/about",
  "/blog",
  "/careers",
  "/careers/spontaneous",
  "/media-kit",
  "/contact",
  "/help-center",
  "/changelog",
  "/terms",
  "/privacy",
];

function alternates(path: string, baseUrl: string): string {
  const localized = routing.locales
    .map(
      (altLocale) =>
        `<xhtml:link rel="alternate" hreflang="${altLocale}" href="${baseUrl}/${altLocale}${path}"/>`
    )
    .join("");
  const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/${X_DEFAULT_LOCALE}${path}"/>`;
  return localized + xDefault;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const para = await params;
  const baseUrl = SITE_URL;
  const currentDate = new Date().toISOString();

  try {
    switch (para.type) {
      case "pages": {
        const urls = pages
          .map((path) =>
            routing.locales
              .map(
                (locale) => `
  <url>
    <loc>${baseUrl}/${locale}${path}</loc>
    <lastmod>${currentDate}</lastmod>
    ${alternates(path, baseUrl)}
  </url>`
              )
              .join("")
          )
          .join("");

        const pagesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

        return new Response(pagesSitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      case "blog": {
        const response = await getArticles({ locale: routing.defaultLocale });
        const posts = response.docs;

        const urls = posts
          .map((post: Article) =>
            routing.locales
              .map(
                (locale) => `
  <url>
    <loc>${baseUrl}/${locale}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
    ${alternates(`/blog/${post.slug}`, baseUrl)}
  </url>`
              )
              .join("")
          )
          .join("");

        const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

        return new Response(blogSitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }

      default:
        return new Response("Sitemap not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
