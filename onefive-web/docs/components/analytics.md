# Composants Analytics

Cette section contient tous les composants modulaires pour la page d'analytics des datarooms.

## Structure des composants

### Composants principaux

- **`AnalyticsHeader`** - En-tête de la page avec navigation, sélection de période et fonctions d'export
- **`KPICard`** - Composant réutilisable pour afficher les métriques clés avec indicateurs de tendance
- **`UsersList`** - Liste des utilisateurs avec fonctionnalité de recherche
- **`FilesTab`** - Onglet pour afficher les analytics par fichier
- **`TimelineTab`** - Onglet pour afficher la timeline d'activité
- **`OverviewTab`** - Onglet vue d'ensemble avec résumé des métriques principales

### Composants de détail

- **`UserDetailsSidebar`** - Sidebar pour afficher les détails d'un utilisateur sélectionné
- **`FileDetailsSidebar`** - Sidebar pour afficher les détails d'un fichier sélectionné

## Utilisation

Tous les composants sont exportés depuis le fichier `index.ts` :

```typescript
import {
    AnalyticsHeader,
    OverviewTab,
    UsersList,
    FilesTab,
    TimelineTab,
    UserDetailsSidebar,
    FileDetailsSidebar,
    KPICard
} from "@/components/analytics";
```

## Architecture

### Responsabilités
- **Composants de présentation** : Affichage des données uniquement
- **Logique métier** : Gérée dans les hooks personnalisés (`useDataroomAnalytics`, `useUserAnalytics`, etc.)
- **État local** : Géré dans le composant parent (`page.tsx`)

### Avantages de cette architecture
1. **Réutilisabilité** : Chaque composant peut être réutilisé dans d'autres contextes
2. **Maintenabilité** : Code plus facile à maintenir et déboguer
3. **Testabilité** : Chaque composant peut être testé indépendamment
4. **Lisibilité** : Code plus organisé et facile à comprendre
5. **Performance** : Optimisations possibles au niveau de chaque composant

## Types

Les types TypeScript sont importés depuis `../../app/dataroom/[id]/analytics/types` :
- `UserAnalytics`
- `FileAnalytics`
- `DashboardStat`
- `ActivityLog` 