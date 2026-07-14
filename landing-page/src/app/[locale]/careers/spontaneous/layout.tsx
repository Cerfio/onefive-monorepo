import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/careers/spontaneous", {
    title:
      locale === "fr"
        ? "Candidature spontanée — Carrières Onefive"
        : "Open application — Careers at Onefive",
    description:
      locale === "fr"
        ? "Pas de poste qui correspond ? Envoyez une candidature spontanée à Onefive."
        : "No role fits? Send an open application to Onefive.",
  });
}

export default async function SpontaneousLayout({
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
