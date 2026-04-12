import { getArticle } from "@/utils/api";

// type Post = {
//   title: string;
//   description: string;
//   featuredImage: {
//     url: string;
//     width: number;
//     height: number;
//     alt: string;
//   };
//   author: {
//     name: string;
//     image: {
//       url: string;
//     };
//   };
//   category: {
//     name: string;
//   };
//   seo: {
//     title: string | null;
//     description: string | null;
//     keywords: string | null;
//     ogImage: string | null;
//   };
// };

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
        description: "L'article demandé n'existe pas."
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

    return {
      metadataBase: new URL("https://onefive.app"),
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        locale: locale === "fr" ? "fr_FR" : "en_US",
        siteName: "Onefive Blog",
        url: `https://onefive.app/${locale}/blog/${slug}`,
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
      authors: [
        {
          name: post.author?.name || "Onefive",
          url: `https://onefive.app/${locale}/author/${(post.author?.name || "onefive").toLowerCase().replace(/\s+/g, "-")}`,
        },
      ],
      keywords: post.seo?.keywords?.split(",") || [
        post.category?.name || "blog",
        "startup",
        "entrepreneuriat",
        "onefive",
      ],
      alternates: {
        canonical: `https://onefive.app/${locale}/blog/${slug}`,
        languages: {
          "fr-FR": `https://onefive.app/fr/blog/${slug}`,
          "en-US": `https://onefive.app/en/blog/${slug}`,
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
      description: "Découvrez nos articles sur l'entrepreneuriat et les startups."
    };
  }
}

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <article className="blog-post">{children}</article>;
}
