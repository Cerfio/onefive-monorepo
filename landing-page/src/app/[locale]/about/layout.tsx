import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/about", {
    title:
      locale === "fr"
        ? "À propos — Onefive"
        : "About — Onefive",
    description:
      locale === "fr"
        ? "Découvrez la mission d'Onefive et l'équipe qui construit la plateforme des entrepreneurs, investisseurs et experts."
        : "The mission and team behind Onefive — the platform connecting entrepreneurs, investors and experts.",
  });
}

export default async function AboutLayout({
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
