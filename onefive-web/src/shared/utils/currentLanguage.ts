"use client";

import availableLanguages from "@/lib/i18n/available-languages";
import useStorage from "@/hooks/useStorage";

const currentLanguage = () => {
  const { getItem } = useStorage();
  const language = getItem("language", "local");

  if (!language) {
    const navigatorLanguage = navigator.language.split("-")[0];
    if (availableLanguages.includes(navigatorLanguage)) {
      localStorage.setItem("language", navigatorLanguage);
      return navigatorLanguage;
    }
    localStorage.setItem("language", "en");
    return "en";
  }

  if (!availableLanguages.includes(language)) {
    localStorage.setItem("language", "en");
    return "en";
  }
  return language;
};

export default currentLanguage;
