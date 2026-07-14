import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// `/` is normally handled by the next-intl middleware (redirect to a locale).
// This is a safety net for requests that reach the root route directly.
//
// The previous implementation sniffed the User-Agent and served different HTML
// to crawlers vs. users (cloaking) — removed, as that is a Google policy risk.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
