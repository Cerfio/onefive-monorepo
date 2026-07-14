import type { Metadata } from "next";
import { SITE_URL } from "./site";

// Locale used for the x-default alternate — kept as "en" to match the app's
// canonical/x-default and the HTTP Link header emitted by next-intl.
const X_DEFAULT_LOCALE = "en";

/**
 * Per-route metadata helper. Produces a self-referencing canonical + the full
 * hreflang cluster (en/fr/x-default) on the `www` host, so each page stops
 * inheriting the homepage's canonical (the site-wide duplicate-metadata bug).
 */
export function pageMetadata(
  locale: string,
  path: string,
  opts: {
    title: string;
    description: string;
    ogType?: "website" | "article";
  }
): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        fr: `${SITE_URL}/fr${path}`,
        "x-default": `${SITE_URL}/${X_DEFAULT_LOCALE}${path}`,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: opts.ogType ?? "website",
      siteName: "Onefive",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      // Re-declare the image: a child `openGraph` replaces the parent's whole
      // object, so without this these pages would lose the social card.
      // Resolved against metadataBase (www) inherited from the root layout.
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/og-image.png"],
    },
  };
}
