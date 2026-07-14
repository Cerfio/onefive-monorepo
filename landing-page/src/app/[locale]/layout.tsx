import { AnalyticsProvider, PostHogProvider } from "@/components/analytics-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteProvider } from "@/components/providers/route-provider";
import { NavbarArticlesProvider } from "@/contexts/NavbarArticlesContext";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { OrganizationSchema, WebsiteSchema } from "@/components/structured-data";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Enable static rendering of the locale segments (next-intl requires the
// locales to be known at build time via generateStaticParams + setRequestLocale).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    // NB: no maximumScale / userScalable:false — blocking pinch-zoom fails
    // WCAG 1.4.4 and is flagged by Lighthouse. Users must be able to zoom.
    viewportFit: "cover",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      siteName: "Onefive",
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@onefivenetwork",
      site: "@onefivenetwork",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
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
    authors: [{ name: "Onefive", url: SITE_URL }],
    generator: "Next.js",
    applicationName: "Onefive",
    referrer: "origin-when-cross-origin",
    keywords: t("keywords").split(","),
    creator: "Onefive",
    publisher: "Onefive",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    // Default alternates for the locale root. Child routes override `canonical`
    // via their own generateMetadata; the language map + x-default is aligned
    // with the host that next-intl emits in the HTTP `Link` header (www, en/fr).
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        fr: `${SITE_URL}/fr`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    category: "technology",
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon-192x192.png", type: "image/png", sizes: "192x192" }, // Google primary (48x4)
        { url: "/favicon-144x144.png", type: "image/png", sizes: "144x144" }, // Google (48x3)
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" }, // Google (48x2)
        { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" }, // Google (48x1)
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" }, // Standard browser
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" }, // Standard browser
        { url: "/favicon.ico", sizes: "32x32" }, // Fallback compatibility
      ],
      shortcut: "/favicon-192x192.png", // Best quality for shortcuts
      apple: [
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
      ],
    },
    appleWebApp: {
      capable: true,
      title: "Onefive",
      statusBarStyle: "default",
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "mobile-web-app-capable": "yes",
      "application-name": "Onefive",
      "msapplication-TileColor": "#5E6AD2",
      "msapplication-config": "/browserconfig.xml",
      // Legacy non-standard `<meta name="sitemap">` removed — the sitemap is
      // declared in robots.txt (see P1-9). It pointed at the duplicate
      // /api/sitemap.xml tree which is being deleted.
    },
    appLinks: {
      ios: {
        url: "onefive://",
        app_store_id: "votre_app_store_id",
      },
      android: {
        package: "app.onefive.android",
        app_name: "Onefive",
      },
      web: {
        url: SITE_URL,
        should_fallback: true,
      },
    },
    archives: [`${SITE_URL}/blog`],
    assets: [`${SITE_URL}/assets`],
    bookmarks: [`${SITE_URL}/features`],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`./../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <OrganizationSchema locale={locale} />
        <WebsiteSchema locale={locale} />
        {/* Force le bon favicon pour Google - Conformes aux exigences */}
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="shortcut icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <NavbarArticlesProvider>
              <RouteProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </RouteProvider>
            </NavbarArticlesProvider>
            <AnalyticsProvider />
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
