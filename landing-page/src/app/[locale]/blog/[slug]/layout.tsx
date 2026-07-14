import { getArticle } from "@/utils/api";
import { setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  try {
    // Récupérer l'article
    const post = await getArticle(slug, locale);

    if (!post) {
      return {
        title: "Article non trouvé",
        description: "L'article demandé n'existe pas.",
        robots: { index: false, follow: true },
      };
    }

    const title = post.seo?.title || post.title;
    const description = post.seo?.description || post.description;

    const seoOgImage = post.seo?.ogImage;
    const ogImage =
      seoOgImage && typeof seoOgImage === "object" && seoOgImage.filename
        ? `${process.env.NEXT_PUBLIC_CDN_URL}/${seoOgImage.filename}`
        : post.featuredImage?.filename
        ? `${process.env.NEXT_PUBLIC_CDN_URL}/${post.featuredImage.filename}`
        : "";

    const canonical = `${SITE_URL}/${locale}/blog/${slug}`;

    return {
      metadataBase: new URL(SITE_URL),
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        locale: locale === "fr" ? "fr_FR" : "en_US",
        siteName: "Onefive Blog",
        url: canonical,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        authors: [post.author?.name || "Onefive"],
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt || post.publishedAt,
        section: post.category?.name || "Blog",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        creator: "@onefivenetwork",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      // Author name only — the previous `/author/<slug>` URL pointed at a route
      // that doesn't exist (404). Re-add a url here once real author pages ship.
      authors: [{ name: post.author?.name || "Onefive" }],
      keywords: post.seo?.keywords?.split(",") || [
        post.category?.name || "blog",
        "startup",
        "entrepreneuriat",
        "onefive",
      ],
      alternates: {
        canonical,
        languages: {
          en: `${SITE_URL}/en/blog/${slug}`,
          fr: `${SITE_URL}/fr/blog/${slug}`,
          "x-default": `${SITE_URL}/en/blog/${slug}`,
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating blog metadata:", error);
    return {
      title: "Onefive Blog",
      description:
        "Découvrez nos articles sur l'entrepreneuriat et les startups.",
    };
  }
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <article className="blog-post">{children}</article>;
}
