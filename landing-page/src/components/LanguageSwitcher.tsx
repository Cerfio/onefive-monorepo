"use client";

import { SUPPORTED_LANGUAGES } from "@/types/languages";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
// import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (locale: string) => {
    const currentLocale = pathname.split("/")[1];
    posthog.capture("language_switched", { from: currentLocale, to: locale });
    const currentPathname = pathname.split("/").slice(2).join("/");
    router.push(`/${locale}/${currentPathname}`);
  };

  return (
    <div>
      {SUPPORTED_LANGUAGES.map((locale: string) => (
        <button key={locale} onClick={() => switchLanguage(locale)}>
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
