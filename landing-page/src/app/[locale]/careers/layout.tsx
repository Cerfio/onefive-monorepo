import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/careers", {
    title:
      locale === "fr"
        ? "Carrières — Onefive"
        : "Careers — Onefive",
    description:
      locale === "fr"
        ? "Rejoignez l'équipe qui construit Onefive. Postes ouverts et candidatures spontanées."
        : "Join the team building Onefive. Open roles and open applications.",
  });
}

export default async function CareersLayout({
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
