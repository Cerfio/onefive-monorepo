# Architecture du File Viewer

Ce dossier contient une architecture modulaire et maintenable pour le visualisateur de fichiers.

## Structure des fichiers

### 📁 Composant principal
- `page.tsx` - Composant principal orchestrant les différents visualisateurs

### 📁 Types et interfaces (`/src/types/`)
- `file-viewer.ts` - Toutes les interfaces TypeScript utilisées

### 📁 Utilitaires (`/src/utils/`)
- `file-utils.ts` - Fonctions utilitaires pour la manipulation des fichiers

### 📁 Hooks personnalisés (`/src/hooks/`)
- `useFileSecurity.ts` - Gestion de la sécurité (désactivation raccourcis, etc.)
- `useFileTracking.ts` - Tracking des sessions et analytics
- `useVideoPlayer.ts` - Logique spécifique au lecteur vidéo

### 📁 Composants UI (`/src/components/`)
- `FileInfoPanel.tsx` - Panneau latéral d'informations
- `NavigationBar.tsx` - Barre de navigation avec commentaires

### 📁 Visualisateurs (`/src/viewers/`)
- `PDFViewer.tsx` - Visualisateur pour les fichiers PDF
- `DocxViewer.tsx` - Visualisateur pour les documents Word
- `ImageViewer.tsx` - Visualisateur pour les images
- `VideoViewer.tsx` - Visualisateur pour les vidéos

## Avantages de cette architecture

### ✅ Maintenabilité
- Code séparé par responsabilité
- Composants réutilisables
- Facile à déboguer et tester

### ✅ Extensibilité
- Ajout facile de nouveaux types de fichiers
- Nouveaux hooks pour de nouvelles fonctionnalités
- Composants modulaires

### ✅ Performance
- Import seulement des composants nécessaires
- Code splitting naturel
- Réutilisation des composants

### ✅ Lisibilité
- Fichiers plus petits et focalisés
- Structure claire et logique
- Séparation des préoccupations

## Utilisation

### Ajouter un nouveau type de fichier

1. Créer un nouveau visualisateur dans `/src/viewers/`
2. Ajouter la fonction de détection dans `/src/utils/file-utils.ts`
3. Ajouter la condition dans `page.tsx`

### Ajouter une nouvelle fonctionnalité

1. Créer un hook personnalisé dans `/src/hooks/`
2. Ajouter les types nécessaires dans `/src/types/file-viewer.ts`
3. Utiliser le hook dans les composants appropriés

### Modifier l'UI

1. Modifier les composants dans `/src/components/`
2. Les changements se propagent automatiquement dans tous les visualisateurs

## Types de fichiers supportés

- 📄 PDF (react-pdf)
- 📝 DOCX (react-doc-viewer)
- 🖼️ Images (img native)
- 🎥 Vidéos (video native avec contrôles personnalisés)

## Fonctionnalités

- 🔒 Sécurité avancée (désactivation raccourcis)
- 📊 Tracking des sessions et événements
- 💬 Système de commentaires
- 🎮 Contrôles vidéo avancés (chapitres, réactions, vitesse)
- 📱 Interface responsive
- ⚡ Performance optimisée 