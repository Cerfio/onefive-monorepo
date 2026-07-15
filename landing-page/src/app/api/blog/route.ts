import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";
import type { Where } from "payload";
import { getPayloadClient } from "@/lib/payload";

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
    const payload = await getPayloadClient();

    const where: Where = { status: { equals: "published" } };

    if (category && category !== "All") {
      where["category.slug"] = { equals: category };
    }

    if (tag) {
      where["tags.slug"] = { in: [tag] };
    }

    if (author) {
      where["author.id"] = { equals: author };
    }

    if (featured) {
      where.isFeatured = { equals: true };
    }

    if (navbar) {
      where.displayOnNavbar = { equals: true };
    }

    // Same shape as the old REST response ({ docs, totalDocs, … }).
    return payload.find({
      collection: "articles",
      where,
      limit,
      page,
      locale: (locale ?? "fr") as never,
      sort: "-publishedAt",
      depth: 2,
    });
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
