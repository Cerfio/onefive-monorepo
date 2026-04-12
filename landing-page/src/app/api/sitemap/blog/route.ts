import { routing } from "@/i18n/routing";
import { getArticles } from "@/utils/blog-api";

export async function GET() {
  const baseUrl = "https://onefive.app";

  try {
    // Récupérer les articles dans la langue par défaut
    const response = await getArticles({ locale: routing.defaultLocale });
    const posts = response.docs;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xhtml="http://www.w3.org/1999/xhtml">
        ${posts
          .map((post: any) =>
            routing.locales
              .map(
                (locale) => `
            <url>
              <loc>${baseUrl}/${locale}/blog/${post.slug}</loc>
              <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>${post.isFeatured ? "0.8" : "0.7"}</priority>
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

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
