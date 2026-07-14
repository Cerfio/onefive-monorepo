import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

// Own canonical so this page isn't treated as a duplicate of the /blog index
// (which the parent blog/layout would otherwise assign it).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/blog/become-writer", {
    title:
      locale === "fr"
        ? "Devenir contributeur — Blog Onefive"
        : "Become a writer — Onefive Blog",
    description:
      locale === "fr"
        ? "Partagez votre expertise entrepreneuriale sur le blog Onefive. Proposez votre candidature de contributeur."
        : "Share your entrepreneurial expertise on the Onefive blog. Apply to become a contributor.",
  });
}

export default async function BecomeWriterLayout({
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
