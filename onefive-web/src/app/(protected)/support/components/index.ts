// Exports pour réutilisation future
// export { default as ChatWidget } from './ChatWidget'; // Commenté pour usage futur

// Types exportés pour une utilisation externe
// Les types sont définis dans page.tsx et peuvent être exportés si nécessaire

// Constantes utiles pour les FAQ
export const FAQ_CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'dataroom', label: 'Datarooms' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'profil', label: 'Profil' },
  { value: 'discussions', label: 'Discussions' },
  { value: 'fichiers', label: 'Fichiers' }
] as const;

export const GUIDE_DIFFICULTIES = {
  facile: { color: 'bg-green-100 text-green-800', label: 'Facile' },
  moyen: { color: 'bg-yellow-100 text-yellow-800', label: 'Moyen' },
  avancé: { color: 'bg-red-100 text-red-800', label: 'Avancé' }
} as const; 