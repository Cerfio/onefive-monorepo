import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

// NB: the Google-for-Jobs JobPosting JSON-LD is intentionally NOT mounted here
// yet — it needs real datePosted / validThrough (and ideally salary) which
// don't exist in the repo. Add <JobPostingSchema job={...}/> from
// "@/components/structured-data" here (this is a Server Component, so it will
// be SSR'd) once those values are provided.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "/careers/senior-full-stack-engineer", {
    title:
      locale === "fr"
        ? "Ingénieur·e Full-Stack Senior — Carrières Onefive"
        : "Senior Full-Stack Engineer — Careers at Onefive",
    description:
      locale === "fr"
        ? "Rejoignez Onefive comme ingénieur·e full-stack senior : React, Node.js, TypeScript. Poste basé à Paris, télétravail possible."
        : "Join Onefive as a Senior Full-Stack Engineer: React, Node.js, TypeScript. Paris-based, remote-friendly.",
  });
}

export default async function SeniorFullStackLayout({
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
