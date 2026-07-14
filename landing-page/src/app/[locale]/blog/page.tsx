import { setRequestLocale } from "next-intl/server";
import Builder from "@/components/builder";
import { getArticles, getBlogCategories } from "@/utils/blog-api";
import Article from "@/types/article.interface";
import BlogList from "./blog-list";

// Server-rendered on demand: the article grid (and its <a href> links) must be
// in the initial HTML so crawlers can discover articles. Dynamic avoids a
// build-time dependency on the CMS.
export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let initialArticles: Article[] = [];
  let totalDocs = 0;
  let categories: string[] = ["All"];

  try {
    const [articlesRes, catsRes] = await Promise.all([
      getArticles({ locale, limit: 12, page: 1 }),
      getBlogCategories(),
    ]);
    if (Array.isArray(articlesRes?.docs)) {
      initialArticles = articlesRes.docs;
      totalDocs = articlesRes.totalDocs ?? initialArticles.length;
    }
    if (Array.isArray(catsRes?.docs)) {
      categories = ["All", ...catsRes.docs.map((c: { name: string }) => c.name)];
    }
  } catch {
    // SSR-resilient: render an empty shell; the client island retries on the
    // user's next interaction.
  }

  return (
    <Builder
      title="Founder Stories & Startup Breakthroughs"
      description="Real-world insights from the entrepreneurial frontline. We share challenges, victories, and actionable strategies for building successful ventures."
      image={null}
      body={
        <BlogList
          initialArticles={initialArticles}
          initialTotalDocs={totalDocs}
          categories={categories}
          locale={locale}
        />
      }
      displayJoinWaitlist={false}
      badge="Blog"
    />
  );
}
