export enum Language {
  EN = "en",
  FR = "fr",
  // Ajoutez d'autres langues au besoin
}

// Vous pouvez également créer un type pour toutes les langues disponibles
export type AvailableLanguage = keyof typeof Language;

// Et une fonction utilitaire pour valider si une chaîne est une langue valide
export function isValidLanguage(lang: string): lang is AvailableLanguage {
  return Object.values(Language).includes(lang as Language);
}

// Constante avec toutes les langues supportées
export const SUPPORTED_LANGUAGES = Object.values(Language);

// Langue par défaut
export const DEFAULT_LANGUAGE = Language.EN; 