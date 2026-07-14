import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

/**
 * This route is a hardcoded MOCK article ("John Doe", placeholder body). It is
 * set to noindex so it can't be indexed or cited by AI while it isn't real.
 *
 * DECISION NEEDED (Yannis): either
 *   (a) delete this folder so /blog/ai-startup-guide falls through to the real
 *       CMS-backed [slug] route, or
 *   (b) replace the mock with real content + a real author, then remove the
 *       `robots: { index: false }` below.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    ...pageMetadata(locale, "/blog/ai-startup-guide", {
      title:
        locale === "fr"
          ? "Construire une startup AI-first — Onefive"
          : "Building an AI-First Startup — Onefive",
      description:
        locale === "fr"
          ? "Considérations clés pour lancer une startup propulsée par l'IA."
          : "Key considerations for launching an AI-powered startup.",
      ogType: "article",
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function AiStartupGuideLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>{children}</>;
}
