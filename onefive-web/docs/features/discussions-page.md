# Structure des Discussions

Ce dossier contient la page de discussions refactorisée en composants modulaires pour une meilleure maintenabilité.

## Structure des fichiers

```
discussions/
├── components/           # Composants réutilisables
│   ├── DiscussionCard.tsx      # Carte d'une discussion individuelle
│   ├── DiscussionShimmer.tsx   # État de chargement
│   ├── DiscussionHeader.tsx    # En-tête avec titre et bouton de création
│   ├── DiscussionFilters.tsx   # Barre de recherche et filtres
│   ├── DiscussionSidebar.tsx   # Sidebar avec les sujets/tags
│   └── index.ts               # Export centralisé des composants
├── modals/              # Modals
│   └── CreateDiscussionModal.tsx  # Modal de création de discussion
├── hooks/               # Hooks personnalisés
│   └── useDiscussionSearch.ts    # Hook pour la recherche avec debounce
├── page.tsx             # Page principale refactorisée
├── layout.tsx           # Layout de la page
└── README.md            # Documentation
```

## Composants

### DiscussionCard
- Affiche une discussion individuelle avec animations de vote
- Gère les interactions utilisateur (upvote, clic)
- Affiche les métadonnées (auteur, réponses, vues, temps)

### DiscussionShimmer
- État de chargement avec animation skeleton
- Utilisé pendant le chargement initial des discussions

### DiscussionHeader
- En-tête de la page avec titre dynamique
- Bouton de création de nouvelle discussion
- Affiche le sujet sélectionné dans le titre

### DiscussionFilters
- Barre de recherche avec debounce
- Filtres de tri (intéressant, nouveau, populaire, etc.)
- Indicateur de résultats de recherche

### DiscussionSidebar
- Liste des sujets/tags disponibles
- Gestion de la sélection/désélection
- Animations d'interaction

### CreateDiscussionModal
- Formulaire complet de création de discussion
- Support pour discussions, sondages et sondages multiples
- Validation des champs
- Sélection de SaaS

## Hooks

### useDiscussionSearch
- Gestion de la recherche avec debounce (500ms)
- État de chargement pendant la recherche
- Optimisation des performances

## Avantages de la refactorisation

1. **Maintenabilité** : Chaque composant a une responsabilité unique
2. **Réutilisabilité** : Les composants peuvent être réutilisés ailleurs
3. **Testabilité** : Plus facile de tester des composants isolés
4. **Performance** : Meilleure optimisation avec des composants plus petits
5. **Lisibilité** : Code plus facile à comprendre et modifier
6. **Séparation des préoccupations** : Logique métier séparée de l'UI

## Utilisation

```tsx
import {
  DiscussionCard,
  DiscussionHeader,
  DiscussionFilters,
  DiscussionSidebar,
} from './components';
import { CreateDiscussionModal } from './modals/CreateDiscussionModal';
import { useDiscussionSearch } from './hooks/useDiscussionSearch';
```

## Migration

L'ancien fichier de 1018 lignes a été divisé en :
- **page.tsx** : ~255 lignes (logique principale)
- **DiscussionCard.tsx** : ~280 lignes (carte de discussion)
- **CreateDiscussionModal.tsx** : ~200 lignes (modal de création)
- **Autres composants** : ~50-100 lignes chacun

**Réduction totale** : ~70% de réduction de la complexité par fichier 