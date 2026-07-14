import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Builder from "@/components/builder";
import { getArticleBySlug } from "@/utils/blog-api";
import { ArticleSchema, BreadcrumbSchema } from "@/components/structured-data";
import { SITE_URL } from "@/lib/site";
import ArticleBody from "./article-body";

// Server-rendered on demand so the article title, body, author and date are in
// the initial HTML (crawlable + AI-citable) rather than fetched client-side.
export const dynamic = "force-dynamic";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let article = null;
  try {
    article = await getArticleBySlug(slug, locale);
  } catch {
    article = null;
  }

  if (!article || !article.title) {
    notFound();
  }

  return (
    <>
      <ArticleSchema
        article={{
          title: article.title,
          description: article.description,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          author: { name: article.author?.name || "Onefive" },
          featuredImage: { filename: article.featuredImage?.filename || "" },
          category: { name: article.category?.name || "Blog" },
          slug,
        }}
        locale={locale}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/${locale}` },
          { name: "Blog", url: `${SITE_URL}/${locale}/blog` },
          { name: article.title, url: `${SITE_URL}/${locale}/blog/${slug}` },
        ]}
      />
      <Builder
        title={null}
        description={null}
        image={null}
        badge={article.category?.name || "Blog"}
        body={<ArticleBody article={article} />}
        displayJoinWaitlist={false}
      />
    </>
  );
}
