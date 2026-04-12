import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getArticleBySlug = cache(
  async (slug: string, locale: string) => {
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&locale=${locale}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch article with slug: ${slug}`);
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return null;
    }

    return data.docs[0];
  },
  ["blog-article-by-slug"],
  { revalidate: 3600 }
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "fr";

  try {
    if (!slug) {
      return NextResponse.json(
        { error: "Article slug is required" },
        { status: 400 }
      );
    }

    const article = await getArticleBySlug(slug, locale);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
