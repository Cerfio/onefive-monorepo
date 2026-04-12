import { routing } from "@/i18n/routing";
import Article from "@/types/article.interface";
import { getArticles } from "@/utils/blog-api";

const pages = [
  { path: "", priority: 1.0, changefreq: "daily" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const para = await params;
  const baseUrl = "https://onefive.app";
  const currentDate = new Date().toISOString();

  try {
    switch (para.type) {
      case "pages":
        const pagesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                  xmlns:xhtml="http://www.w3.org/1999/xhtml">
            ${pages
              .map((page) =>
                routing.locales
                  .map(
                    (locale) => `
                <url>
                  <loc>${baseUrl}/${locale}${page.path}</loc>
                  <lastmod>${currentDate}</lastmod>
                  <changefreq>${page.changefreq}</changefreq>
                  <priority>${page.priority}</priority>
                  ${routing.locales
                    .map(
                      (altLocale) => `
                    <xhtml:link 
                      rel="alternate" 
                      hreflang="${altLocale}" 
                      href="${baseUrl}/${altLocale}${page.path}"
                    />`
                    )
                    .join("")}
                </url>
              `
                  )
                  .join("")
              )
              .join("")}
          </urlset>`;
        return new Response(pagesSitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });

      case "blog":
        const response = await getArticles({ locale: routing.defaultLocale });
        const posts = response.docs;

        const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                  xmlns:xhtml="http://www.w3.org/1999/xhtml">
            ${posts
              .map((post: Article) =>
                routing.locales
                  .map(
                    (locale) => `
                <url>
                  <loc>${baseUrl}/${locale}/blog/${post.slug}</loc>
                  <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
                  <changefreq>weekly</changefreq>
                  <priority>0.8</priority>
                  ${routing.locales
                    .map(
                      (altLocale) => `
                    <xhtml:link 
                      rel="alternate" 
                      hreflang="${altLocale}" 
                      href="${baseUrl}/${altLocale}/blog/${post.slug}"
                    />`
                    )
                    .join("")}
                </url>
              `
                  )
                  .join("")
              )
              .join("")}
          </urlset>`;
        return new Response(blogSitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });

      default:
        return new Response("Sitemap not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
