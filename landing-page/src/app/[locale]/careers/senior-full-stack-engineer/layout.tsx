import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { JobPostingSchema } from "@/components/structured-data";

// TODO(onefive): replace with the REAL posting dates before relying on Google
// for Jobs — a wrong datePosted shows a wrong "posted N days ago" publicly.
const DATE_POSTED = "2026-07-01";
const VALID_THROUGH = "2026-12-31";

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
  return (
    <>
      {children}
      {/* SSR'd JobPosting (Google for Jobs). Salary intentionally omitted until
          confirmed; dates are placeholders — see TODO above. */}
      <JobPostingSchema
        job={{
          title: "Senior Full-Stack Engineer",
          description:
            "Onefive is hiring a Senior Full-Stack Engineer to build its core platform with React, Node.js and TypeScript. You'll ship product features end-to-end, shape technical decisions and help grow the engineering team. Paris-based, remote-friendly within Europe.",
          datePosted: DATE_POSTED,
          validThrough: VALID_THROUGH,
          employmentType: "FULL_TIME",
          addressLocality: "Paris",
          addressCountry: "FR",
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: "Europe",
          skills: "React, Node.js, TypeScript, AWS",
          identifier: "senior-full-stack-engineer",
        }}
      />
    </>
  );
}
