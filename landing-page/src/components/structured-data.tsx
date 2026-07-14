import { SITE_URL } from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const ORG_LOGO = {
  "@type": "ImageObject",
  url: `${SITE_URL}/favicon-192x192.png`,
  width: 192,
  height: 192,
} as const;

// Real, active social profiles taken from the site footer.
// (The previous list pointed at non-existent handles — keep this in sync with
// the footer links if they change.)
const ORG_SAME_AS = [
  "https://www.linkedin.com/company/onefive-social-network-fr",
  "https://x.com/onefivenetwork",
  "https://www.youtube.com/@onefivenetwork",
  "https://www.facebook.com/onefiveapp",
  "https://www.instagram.com/one_five_app",
  "https://www.tiktok.com/@onefive.five",
];

interface OrganizationSchemaProps {
  locale: string;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    "name": "Onefive",
    "alternateName": "Onefive Network",
    "url": SITE_URL,
    "logo": ORG_LOGO,
    "description": locale === "fr"
      ? "Onefive est la plateforme qui connecte entrepreneurs, investisseurs et experts. Trouvez des partenaires, accédez à une dataroom sécurisée et développez votre startup."
      : "Onefive is the platform that connects entrepreneurs, investors and experts. Find partners, access a secure dataroom and grow your startup.",
    "sameAs": ORG_SAME_AS,
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
      url?: string;
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
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/${locale}/blog/${article.slug}#article`,
    "headline": article.title,
    "description": article.description,
    "image": `${process.env.NEXT_PUBLIC_CDN_URL}/${article.featuredImage.filename}`,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      ...(article.author.url ? { url: article.author.url } : {}),
    },
    "publisher": {
      "@type": "Organization",
      "@id": ORG_ID,
      "name": "Onefive",
      "logo": ORG_LOGO,
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${locale}/blog/${article.slug}`
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
    "@id": WEBSITE_ID,
    "name": "Onefive",
    "url": SITE_URL,
    "publisher": { "@id": ORG_ID },
    "description": locale === "fr"
      ? "Le réseau social des startups et entrepreneurs. Connectez-vous avec des investisseurs, accédez à des ressources et développez votre startup."
      : "The social network for startups and entrepreneurs. Connect with investors, access resources and grow your startup.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/${locale}/blog?search={search_term_string}`
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

interface JobPostingSchemaProps {
  job: {
    title: string;
    /** Plain text or minimal HTML description of the role. */
    description: string;
    /** ISO date the posting went live, e.g. "2026-04-12". */
    datePosted: string;
    /** ISO date the posting expires. Recommended by Google. */
    validThrough?: string;
    /** e.g. "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN". */
    employmentType?: string;
    addressLocality?: string;
    addressCountry?: string;
    /** e.g. "TELECOMMUTE" for remote roles. */
    jobLocationType?: string;
    /** ISO country/region name(s) applicants may be located in, for remote roles. */
    applicantLocationRequirements?: string;
    identifier?: string;
    skills?: string;
  };
}

/**
 * Google-for-Jobs eligible JobPosting markup. NB: for this to be seen by the
 * crawler it must be rendered server-side — mount it on a Server Component
 * (or a server wrapper) of the job page, not inside a "use client" tree.
 */
export function JobPostingSchema({ job }: JobPostingSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    ...(job.identifier
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: "Onefive",
            value: job.identifier,
          },
        }
      : {}),
    "datePosted": job.datePosted,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    "employmentType": job.employmentType ?? "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "@id": ORG_ID,
      "name": "Onefive",
      "sameAs": SITE_URL,
      "logo": ORG_LOGO,
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.addressLocality ?? "Paris",
        "addressCountry": job.addressCountry ?? "FR",
      },
    },
    ...(job.jobLocationType ? { jobLocationType: job.jobLocationType } : {}),
    ...(job.applicantLocationRequirements
      ? {
          applicantLocationRequirements: {
            "@type": "Country",
            name: job.applicantLocationRequirements,
          },
        }
      : {}),
    ...(job.skills ? { skills: job.skills } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
