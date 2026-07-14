import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

// Metadata for the /blog index. Article routes (/blog/[slug]) and the static
// mock (/blog/ai-startup-guide) override this via their own nested layouts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/blog", {
    title:
      locale === "fr"
        ? "Blog Onefive — récits de founders & guides startup"
        : "Onefive Blog — founder stories & startup guides",
    description:
      locale === "fr"
        ? "Retours d'expérience du terrain entrepreneurial : défis, victoires et stratégies concrètes pour construire une startup."
        : "Real-world insights from the entrepreneurial frontline: challenges, wins and actionable strategies for building a startup.",
  });
}

export default async function BlogLayout({
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
