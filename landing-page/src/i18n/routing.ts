import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr"],

  // Used when no locale matches.
  // NB: production serves "/" → "/en" (the middleware previously hardcoded
  // "en", diverging from this file). Kept as "en" to preserve current behaviour
  // while removing that divergence. Want "/fr" as the default for a FR-first
  // audience? Change this single value.
  defaultLocale: "en",

  localePrefix: "always"  // Forcer l'affichage du préfixe de locale
});
