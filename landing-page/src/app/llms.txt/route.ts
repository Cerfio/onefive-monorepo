import { SITE_URL } from "@/lib/site";

// Served at /llms.txt — a compact, crawler-friendly map of the site for AI
// agents. Extend the Resources list as real blog articles ship (do not list
// placeholder/test URLs).
export async function GET() {
  const body = `# Onefive

> Onefive is the platform connecting entrepreneurs, investors and experts —
> networking, a secure fundraising dataroom, and startup resources in one
> ecosystem. Founded 2025, Paris, France.

## Company
- [About](${SITE_URL}/en/about): Mission, values, and the team behind Onefive.

## Resources
- [Blog](${SITE_URL}/en/blog): Founder stories and startup guides.

## Optional
- [Version française](${SITE_URL}/fr)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
