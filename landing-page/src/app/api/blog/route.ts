import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

function buildBlogArticlesCacheKey(params: {
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  limit: number;
  page: number;
  navbar?: boolean;
  locale?: string;
}) {
  return [
    "blog-articles",
    String(params.navbar ?? false),
    String(params.page),
    String(params.limit),
    params.locale ?? "fr",
    params.category ?? "",
    params.tag ?? "",
    params.author ?? "",
    String(params.featured ?? false),
  ];
}

const getBlogArticles = (
  params: {
    category?: string;
    tag?: string;
    author?: string;
    featured?: boolean;
    limit: number;
    page: number;
    navbar?: boolean;
    locale?: string;
  }
) => {
  const { category, tag, author, featured, limit, page, navbar, locale } =
    params;

  const fetchArticles = async () => {
    let url = `${process.env.PAYLOAD_URL}/api/articles?limit=${limit}&locale=${locale}&page=${page}&sort=-publishedAt&where[status][equals]=published&depth=2`;

    if (category && category !== "All") {
      url += `&where[category.slug][equals]=${encodeURIComponent(category)}`;
    }

    if (tag) {
      url += `&where[tags.slug][in]=${encodeURIComponent(tag)}`;
    }

    if (author) {
      url += `&where[author.id][equals]=${encodeURIComponent(author)}`;
    }

    if (featured) {
      url += `&where[isFeatured][equals]=true`;
    }

    if (navbar) {
      url += `&where[displayOnNavbar][equals]=true`;
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch articles from PayloadCMS");
    }
    return response.json();
  };

  return cache(fetchArticles, buildBlogArticlesCacheKey(params), {
    revalidate: 60,
  })();
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const navbar = searchParams.get("navbar") === "true";
    const locale = searchParams.get("locale") || "fr";

    const data = await getBlogArticles({
      category: category || undefined,
      tag: tag || undefined,
      author: author || undefined,
      featured: featured || false,
      limit,
      page,
      navbar,
      locale,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
