# Backoffice Admin OneFive

> **Solution retenue** : App Next.js dédiée (`onefive-admin`) consommant l'API `onefive-back`  
> **Date** : Février 2026

---

## Vue d'ensemble

Le backoffice permet d'administrer OneFive et d'accéder aux statistiques : users, waitlist, spotlight, posts, modération, analytics.

**Architecture** : Une seule source de vérité — tout passe par l'API `onefive-back`. Pas de duplication de données.

---

## Architecture

```
onefive/
├── onefive-back/          # API NestJS (existant)
│   └── AdminGuard, endpoints admin
├── onefive-front/         # App utilisateur (existant)
├── onefive-admin/         # Nouvelle app backoffice
│   └── Consomme onefive-back via API
└── onefive-bo/            # PayloadCMS — contenu éditorial uniquement (articles, changelog)
```

| App | Rôle |
|-----|------|
| **onefive-back** | API principale, données Prisma, AdminGuard |
| **onefive-front** | App utilisateur (feed, auth, profil) |
| **onefive-admin** | Dashboard admin (users, stats, modération) |
| **onefive-bo** | Contenu éditorial (blog, newsletters) — optionnel |

---

## Structure proposée `onefive-admin`

```
onefive-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Sidebar + vérif admin
│   │   │   ├── page.tsx             # Dashboard / stats globales
│   │   │   ├── users/
│   │   │   ├── waitlist/
│   │   │   ├── spotlight/
│   │   │   ├── posts/
│   │   │   ├── moderation/
│   │   │   └── analytics/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   └── api.ts                  # Client API vers onefive-back
│   └── hooks/
├── .env.local
└── package.json
```

---

## Stack technique

| Techno | Usage |
|--------|-------|
| **Next.js 15** | App Router |
| **TanStack Query** | Appels API, cache |
| **Tailwind CSS** | Styling |
| **shadcn/ui ou Tremor** | Composants, charts |

---

## Authentification

- Réutiliser l'auth existante de `onefive-back` (JWT/session).
- Vérifier le rôle admin côté front via `GET /auth/me` (ou équivalent) avec `roles`.
- Rediriger vers `/login` si non admin.
- Tous les appels API envoient le token ; `AdminGuard` valide côté backend.

---

## Endpoints backend à avoir

| Domaine | Endpoints | État |
|---------|-----------|------|
| **Spotlight** | CRUD admin | ✅ `admin-spotlight.controller` |
| **Users** | `GET /admin/users` (liste, pagination, filtres) | À créer |
| **Waitlist** | `GET /admin/waitlist`, stats, export | Partiel |
| **Posts** | Liste, modération (flag, suppression) | À créer |
| **Modération** | Signalements, actions | À créer |
| **Analytics** | Stats globales (users, posts, activité) | À créer |

---

## Variables d'environnement

```env
# onefive-admin/.env.local
NEXT_PUBLIC_API_URL=https://api.onefive.app   # ou http://localhost:3000 en dev
```

---

## Déploiement

- **URL** : `admin.onefive.app` ou `bo.onefive.app`
- **Port dev** : 3001 (éviter conflit avec front 3000, back 3000)

---

## Plan d'action

1. Créer le projet `onefive-admin` (Next.js 15)
2. Configurer l'auth (login + vérification admin)
3. Layout dashboard (sidebar, navigation)
4. Implémenter les vues : users → waitlist → spotlight → posts → modération → analytics
5. Créer les endpoints admin manquants dans `onefive-back` au fur et à mesure

---

## Référence

- `onefive-back/.cursorrules` — Architecture backend
- `onefive-back/src/common/guards/admin.guard.ts` — AdminGuard
- `onefive-back/src/spotlight/admin-spotlight.controller.ts` — Exemple endpoint admin
