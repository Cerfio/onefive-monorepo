# 🏷️ Système de Badges de Raison d'Affichage des Posts

## 📋 Vue d'ensemble

Le système de badges de raison d'affichage permet aux utilisateurs de comprendre **pourquoi** chaque post leur est présenté dans leur feed. Cette fonctionnalité améliore la transparence de l'algorithme et l'expérience utilisateur.

## 🎯 Objectifs

- **Transparence** : Expliquer clairement pourquoi un contenu est affiché
- **Confiance** : Identifier le contenu sponsorisé de manière transparente
- **Éducation** : Aider les utilisateurs à comprendre le fonctionnement de l'algorithme
- **Découvrabilité** : Encourager l'exploration de différents types de contenu

## 🏷️ Types de Badges Disponibles

### 1. 🩷 **Recommandé** (`RECOMMENDATION`)
- **Couleur** : Rose (`text-pink-600 bg-pink-50 border-pink-200`)
- **Icône** : ❤️ (Heart)
- **Description** : Posts suggérés par l'algorithme de recommandation
- **Tooltip** : "Ce post vous est recommandé en fonction de vos intérêts et de votre activité"

### 2. 🔵 **Votre réseau** (`RELATION`)
- **Couleur** : Bleu (`text-blue-600 bg-blue-50 border-blue-200`)
- **Icône** : 👥 (Users)
- **Description** : Posts provenant de connexions directes ou d'abonnements
- **Tooltip** : "Ce post provient de votre réseau (connexions, abonnements)"

### 3. 🟠 **Tendance** (`TRENDING`)
- **Couleur** : Orange (`text-orange-600 bg-orange-50 border-orange-200`)
- **Icône** : 📈 (TrendingUp)
- **Description** : Contenu viral ou populaire actuellement
- **Tooltip** : "Ce post est populaire et en tendance actuellement"

### 4. 🟢 **Hashtag suivi** (`FOLLOWED_HASHTAG`)
- **Couleur** : Vert (`text-green-600 bg-green-50 border-green-200`)
- **Icône** : # (Hash)
- **Description** : Posts contenant des hashtags suivis par l'utilisateur
- **Tooltip** : "Ce post contient des hashtags que vous suivez"

### 5. 🟣 **Sponsorisé** (`SPONSORED`)
- **Couleur** : Violet (`text-purple-600 bg-purple-50 border-purple-200`)
- **Icône** : 💰 (DollarSign)
- **Description** : Contenu publicitaire payant
- **Tooltip** : "Contenu sponsorisé - Cette publication est une publicité"

### 6. 🔵 **Votre publication** (`YOUR_POST`)
- **Couleur** : Indigo (`text-indigo-600 bg-indigo-50 border-indigo-200`)
- **Icône** : 👤 (User)
- **Description** : Posts créés par l'utilisateur lui-même
- **Tooltip** : "Votre propre publication"

### 7. 🟡 **Nouveau** (`NEW_CONTENT`)
- **Couleur** : Jaune (`text-yellow-600 bg-yellow-50 border-yellow-200`)
- **Icône** : ✨ (Sparkles)
- **Description** : Contenu récent dans les domaines d'intérêt
- **Tooltip** : "Nouveau contenu dans vos domaines d'intérêt"

### 8. 🔷 **Local** (`LOCATION_BASED`)
- **Couleur** : Teal (`text-teal-600 bg-teal-50 border-teal-200`)
- **Icône** : 📍 (MapPin)
- **Description** : Contenu basé sur la géolocalisation
- **Tooltip** : "Contenu local ou régional basé sur votre géolocalisation"

### 9. 🔵 **Événement** (`EVENT_RELATED`)
- **Couleur** : Cyan (`text-cyan-600 bg-cyan-50 border-cyan-200`)
- **Icône** : 📅 (Calendar)
- **Description** : Contenu lié à des événements suivis
- **Tooltip** : "Contenu lié à des événements que vous suivez"

### 10. ⚫ **Collègue** (`COLLEAGUE`)
- **Couleur** : Gris (`text-slate-600 bg-slate-50 border-slate-200`)
- **Icône** : 🏢 (Building)
- **Description** : Contenu professionnel de collègues ou de l'entreprise
- **Tooltip** : "Contenu de vos collègues ou de votre entreprise"

### 11. 🌹 **Mention** (`MENTIONED`)
- **Couleur** : Rose (`text-rose-600 bg-rose-50 border-rose-200`)
- **Icône** : @ (AtSign)
- **Description** : Posts où l'utilisateur est mentionné
- **Tooltip** : "Vous êtes mentionné(e) dans ce post"

## 🔧 Implémentation Technique

### Structure des fichiers

```
src/features/post/
├── components/post/
│   ├── PostDisplayBadge.tsx    # Composant principal du badge
│   ├── PostHeader.tsx          # Header avec badge intégré
│   └── Post.tsx               # Composant post principal
├── post.api.ts                # Types et enum des raisons
└── hooks/queries/
    └── usePost.ts             # Hook avec données de test
```

### Types TypeScript

```typescript
export const PostDisplayReason = {
  RECOMMENDATION: 'recommendation',
  RELATION: 'relation',
  TRENDING: 'trending',
  FOLLOWED_HASHTAG: 'followed_hashtag',
  SPONSORED: 'sponsored',
  YOUR_POST: 'your_post',
  NEW_CONTENT: 'new_content',
  LOCATION_BASED: 'location_based',
  EVENT_RELATED: 'event_related',
  COLLEAGUE: 'colleague',
  MENTIONED: 'mentioned',
} as const;

export type PostDisplayReasonType = typeof PostDisplayReason[keyof typeof PostDisplayReason];
```

### Schema Zod

```typescript
displayReason: z.enum([
  PostDisplayReason.RECOMMENDATION, 
  PostDisplayReason.RELATION, 
  PostDisplayReason.TRENDING, 
  PostDisplayReason.FOLLOWED_HASHTAG, 
  PostDisplayReason.SPONSORED,
  PostDisplayReason.YOUR_POST,
  PostDisplayReason.NEW_CONTENT,
  PostDisplayReason.LOCATION_BASED,
  PostDisplayReason.EVENT_RELATED,
  PostDisplayReason.COLLEAGUE,
  PostDisplayReason.MENTIONED
])
```

## 🎨 Design et UX

### Positionnement
- **Emplacement** : Coin supérieur droit du header du post
- **À côté de** : Menu dropdown des actions du post
- **Espacement** : Gap de 8px entre le badge et le dropdown

### Interaction
- **Hover** : Affichage d'un tooltip explicatif
- **Cursor** : `cursor-help` pour indiquer l'interactivité
- **Accessibilité** : Support complet des lecteurs d'écran

### Responsive
- **Mobile** : Badge adapté avec une taille optimisée
- **Desktop** : Taille standard avec tooltip complet

## 📱 Utilisation

### Intégration dans un Post

```tsx
import { Post } from '@/features/post/components/post';

// Post avec badge automatique basé sur l'algorithme
<Post postId="example-post-id" />
```

### Affichage manuel d'un badge

```tsx
import { PostDisplayBadge } from '@/features/post/components/post';
import { PostDisplayReason } from '@/features/post/post.api';

<PostDisplayBadge displayReason={PostDisplayReason.RECOMMENDATION} />
```

## 🔮 Évolutions futures

### Extensions possibles
- **Badges multiples** : Combiner plusieurs raisons (ex: "Tendance + Réseau")
- **Badges personnalisés** : Permettre aux entreprises d'ajouter leurs propres raisons
- **Analytics** : Suivre l'engagement par type de badge
- **Filtrage** : Permettre aux utilisateurs de filtrer par type de badge

### Optimisations
- **Performance** : Lazy loading des tooltips
- **Animations** : Micro-interactions pour améliorer l'UX
- **Internationalisation** : Support multilingue des labels et tooltips

## 🚀 Déploiement

### Backend Requirements
- Ajouter le champ `displayReason` à l'API des posts
- Implémenter la logique métier pour déterminer la raison d'affichage
- Mise à jour des types TypeScript côté serveur

### Frontend Deployment
- ✅ Composants développés et testés
- ✅ Types TypeScript définis
- ✅ Documentation complète
- 🔄 Tests d'intégration à effectuer
- 🔄 Tests de régression UI

---

**Créé le** : 31 juillet 2025  
**Version** : 1.0  
**Maintenu par** : Équipe OneFive
