# 🚀 OneFive - Frontend

Plateforme de networking professionnel pour l'écosystème startup avec fonctionnalités avancées de collaboration et d'investissement.

## 🎯 Vue d'ensemble

OneFive est une plateforme sociale professionnelle qui connecte entrepreneurs, investisseurs et talents dans l'écosystème startup. L'application offre des fonctionnalités complètes de networking, de collaboration, et de gestion de projets.

## ✨ Fonctionnalités principales

### 🌐 Réseau Social Professionnel
- **Feed interactif** avec posts, réactions et commentaires
- **Système de connexions** et networking professionnel
- **Profiles utilisateurs** détaillés avec parcours et compétences

### 💼 Datarooms & Collaboration
- **Gestion de documents** avec versioning automatique
- **Analytics avancées** de consultation des fichiers
- **Partage sécurisé** avec gestion des permissions

### 💬 Communication
- **Discussions threadées** avec votes et réactions
- **Messagerie instantanée** avec fichiers et emojis
- **Notifications en temps réel**

### 🚀 Écosystème Startup
- **Profils startup** avec cap tables et métriques
- **Système d'investissement** et suivi des rondes
- **Découverte d'opportunités** avec géolocalisation

### 📊 Analytics & Insights
- **Tableaux de bord** détaillés
- **Suivi des interactions** et engagement
- **Métriques de performance** en temps réel

## 🛠️ Stack Technique

### Framework & Core
- **Next.js 15.3** avec App Router
- **React 19** avec TypeScript 5.8
- **Tailwind CSS v4.1** pour le styling
- **Untitled UI Components** pour l'interface

### State Management & Data
- **TanStack Query** pour la gestion d'état serveur
- **React Context** pour l'état global
- **Next.js API Routes** pour les endpoints

### Fonctionnalités Avancées
- **Internationalisation** (Français/Anglais) avec next-intl
- **Authentification** complète avec onboarding
- **Uploads de fichiers** avec prévisualisation
- **Notifications push** et en temps réel

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- pnpm (recommandé) ou npm

### Installation

```bash
# Cloner le repository
git clone https://github.com/Onefive-Social-Network/onefive-front.git
cd onefive-front

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

### Scripts disponibles

```bash
pnpm dev          # Serveur de développement
pnpm dev:turbo    # Serveur avec Turbopack (plus rapide)
pnpm build        # Build de production
pnpm start        # Serveur de production
pnpm lint         # Vérification ESLint
```

## 📁 Structure du projet

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Routes d'authentification
│   ├── (protected)/       # Routes protégées
│   └── api/               # API Routes
├── components/            # Composants réutilisables
│   ├── base/             # Composants de base (buttons, inputs)
│   ├── application/       # Composants applicatifs complexes
│   └── ui/               # Composants UI (shadcn/ui style)
├── features/             # Fonctionnalités par domaine
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et configuration
├── providers/            # Context providers
├── queries/              # TanStack Query hooks
├── services/             # Services API
├── types/                # Types TypeScript globaux
└── utils/                # Fonctions utilitaires
```

## 📖 Documentation

La documentation complète est disponible dans le dossier `docs/` :

- **[📚 Documentation complète](./docs/README.md)** - Index de toute la documentation
- **[🔧 Guide développeur](./docs/development/claude-guide.md)** - Architecture et conventions
- **[🎨 Composants](./docs/components/)** - Documentation des composants
- **[✨ Fonctionnalités](./docs/features/)** - Guide des fonctionnalités

## 🌐 Environnements

### Développement
- **URL locale** : `http://localhost:3000`
- **Hot reload** activé
- **Source maps** disponibles

### Production
- **Build optimisé** avec Turbopack
- **Compression automatique**
- **Cache stratégique**

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env.local` :

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.onefive.app
NEXT_PUBLIC_APP_URL=https://app.onefive.app

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Path Aliases

```typescript
// Imports configurés
import { Button } from '@/components/base/Button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
```

## 🎨 Design System

### Couleurs principales
- **Primary** : `#5E6AD2` (Bleu OneFive)
- **Secondary** : `#101828` (Gris foncé)
- **Accent** : `#475467` (Gris moyen)

### Composants UI
- **Untitled UI React** pour les composants de base
- **Tailwind CSS** pour le styling
- **CSS Custom Properties** pour le theming
- **React Aria** pour l'accessibilité

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests avec coverage
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

## 📊 Performance

### Optimisations
- **Code splitting** automatique
- **Image optimization** avec Next.js
- **Bundle analysis** intégré
- **Cache strategies** optimisées

### Monitoring
- **Web Vitals** tracking
- **Error boundaries** pour la résilience
- **Performance metrics** en temps réel

## 🤝 Contribution

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de code
- **ESLint** + **Prettier** configurés
- **TypeScript strict** mode
- **Conventional Commits** recommandés
- **Tests** requis pour les nouvelles fonctionnalités

## 📝 License

Ce projet est sous licence propriétaire OneFive. Tous droits réservés.

## 📞 Support

- **Email** : dev@onefive.app
- **Documentation** : [docs.onefive.app](https://docs.onefive.app)
- **Discord** : [Communauté OneFive](https://discord.gg/onefive)

---

**Développé avec ❤️ par l'équipe OneFive**

*Dernière mise à jour* : 31 juillet 2025
