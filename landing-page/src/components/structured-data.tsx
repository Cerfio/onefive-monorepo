interface OrganizationSchemaProps {
  locale: string;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Onefive",
    "alternateName": "Onefive Network",
    "url": "https://onefive.app",
    "logo": "https://onefive.app/onefive.svg",
    "description": locale === "fr" 
      ? "Onefive est la plateforme qui connecte entrepreneurs, investisseurs et experts. Trouvez des partenaires, accédez à une dataroom sécurisée et développez votre startup."
      : "Onefive is the platform that connects entrepreneurs, investors and experts. Find partners, access a secure dataroom and grow your startup.",
    "sameAs": [
      "https://linkedin.com/company/onefive",
      "https://twitter.com/onefive",
      "https://github.com/Onefive-Social-Network"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"]
    },
    "foundingDate": "2025",
    "foundingLocation": {
      "@type": "Place",
      "name": "Paris, France"
    },
    "knowsAbout": [
      "Startups",
      "Entrepreneurship", 
      "Investment",
      "Business networking",
      "Data room services"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  article: {
    title: string;
    description: string;
    publishedAt: string;
    updatedAt?: string;
    author: {
      name: string;
    };
    featuredImage: {
      filename: string;
    };
    category: {
      name: string;
    };
    slug: string;
  };
  locale: string;
}

export function ArticleSchema({ article, locale }: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": `${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`,
    "author": {
      "@type": "Person",
      "name": article.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Onefive",
      "logo": {
        "@type": "ImageObject",
        "url": "https://onefive.app/onefive.svg"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://onefive.app/${locale}/blog/${article.slug}`
    },
    "articleSection": article.category.name,
    "inLanguage": locale === "fr" ? "fr-FR" : "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  locale: string;
}

export function WebsiteSchema({ locale }: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Onefive",
    "url": "https://onefive.app",
    "description": locale === "fr"
      ? "Le réseau social des startups et entrepreneurs. Connectez-vous avec des investisseurs, accédez à des ressources et développez votre startup."
      : "The social network for startups and entrepreneurs. Connect with investors, access resources and grow your startup.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://onefive.app/${locale}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": locale === "fr" ? "fr-FR" : "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 