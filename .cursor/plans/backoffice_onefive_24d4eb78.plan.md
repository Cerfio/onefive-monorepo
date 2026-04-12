---
name: Backoffice Onefive
overview: "Construire le backoffice applicatif de Onefive en deux parties : un frontend dans `onefive-backoffice` et un module `admin` dédié dans `onefive-back`."
todos:
  - id: backend-admin-guard
    content: AdminSessionGuard + AdminPermissionGuard + RBAC complet dans onefive-back
    status: completed
  - id: backend-admin-module
    content: Module admin complet avec handlers (users, waitlist, spotlight, posts, discussions, startups, admins, invitations, audit-logs, dashboard, datarooms)
    status: completed
  - id: frontend-scaffold
    content: "onefive-backoffice : package.json, tsconfig, tailwind v4, next.config, structure de dossiers"
    status: completed
  - id: frontend-auth
    content: Page login admin + vérification session dans le layout admin
    status: completed
  - id: frontend-layout
    content: Sidebar avec highlight actif + topbar + composants base (Button, Pagination, EmptyState)
    status: completed
  - id: frontend-pages
    content: "Pages complètes : dashboard (métriques), users (recherche + ban + delete), waitlist, posts, discussions, spotlight (CRUD avec formulaire), startups, datarooms, admins, audit-logs — toutes avec pagination et états vides"
    status: completed
isProject: false
---

# **Plan — Backoffice Onefive**

## **Contexte**

- `onefive-bo-landing-page` **gère le CMS Payload de la landing page**
- `onefive-backoffice` **est le backoffice applicatif (nouveau projet)**
- `onefive-back` **suit le pattern Controller → Handler → Service obligatoire**

---

## **Partie 1 — Frontend :** `onefive-backoffice`

### **Stack**

- **Next.js 15 + React 19 + TypeScript 5.8**
- **Tailwind CSS v4**
- `@untitledui/icons`
- **React Hook Form + Zod** (login)
- **ky (HTTP client)**
- **Admin en français uniquement**
- **Port :** `3003`

### **Structure des dossiers**

```
src/
├── app/
│   ├── login/                # Page de connexion admin
│   ├── page.tsx              # Redirect → /login
│   └── (admin)/              # Layout admin protégé
│       ├── layout.tsx        # Sidebar + auth check
│       ├── dashboard/        # Métriques globales
│       ├── users/            # Liste + recherche + ban + delete
│       ├── startups/         # Liste + delete
│       ├── posts/            # Modération + delete
│       ├── discussions/      # Modération + delete
│       ├── spotlight/        # CRUD complet avec formulaire
│       ├── waitlist/         # Liste + accept
│       ├── datarooms/        # Vue lecture seule
│       ├── admins/           # Gestion admins + invitations + rôles
│       └── audit-logs/       # Historique actions admin
├── components/
│   └── base/
│       ├── button.tsx
│       ├── pagination.tsx
│       └── empty-state.tsx
└── lib/
    ├── api.ts                # Instance ky avec credentials
    └── cn.ts                 # clsx + tailwind-merge
```

### **Pages et fonctionnalités**

- `/login` — Connexion admin (session cookie via backend)
- `/dashboard` — Résumé: nb users, startups, posts, discussions, waitlist, datarooms, spots
- `/users` — Liste paginée, recherche, ban/unban, suppression
- `/startups` — Liste paginée, suppression
- `/posts` — Modération paginée, suppression
- `/discussions` — Modération paginée, suppression
- `/spotlight` — CRUD complet (list, create avec formulaire, update, delete)
- `/waitlist` — Liste paginée + action accept
- `/datarooms` — Vue lecture seule paginée
- `/admins` — Gestion admins, rôles, superadmin, invitations
- `/audit-logs` — Historique des actions admin

---

## **Partie 2 — Backend : module** `admin` **dans** `onefive-back`

### **Architecture RBAC**

- `AdminUser` model séparé (pas User.isAdmin)
- `AdminRole`, `AdminPermission`, `AdminRolePermission`
- `AdminSession` pour l'authentification
- `AdminAuditLog` pour la traçabilité
- `AdminInvitation` pour inviter de nouveaux admins
- Guards: `AdminSessionGuard`, `AdminPermissionGuard`

### **Module** `src/admin/`

```
src/admin/
├── admin.module.ts
├── admin.controller.ts
├── admin-auth.controller.ts
├── admin.service.ts
├── admin.constants.ts
├── admin.decorators.ts
├── admin-cookie.utils.ts
├── admin-request.type.ts
├── dto/
├── guards/
│   ├── admin-session.guard.ts
│   └── admin-permission.guard.ts
└── handlers/ (30+ handlers)
```

### **Endpoints**


| **Méthode** | **Route**                           | **Action**                  |
| ----------- | ----------------------------------- | --------------------------- |
| **POST**    | `/admin/auth/signin`                | **Connexion**               |
| **POST**    | `/admin/auth/logout`                | **Déconnexion**             |
| **GET**     | `/admin/auth/me`                    | **Session courante**        |
| **POST**    | `/admin/auth/invitations`           | **Inviter un admin**        |
| **POST**    | `/admin/auth/accept-invitation`     | **Accepter invitation**     |
| **GET**     | `/admin/dashboard`                  | **Stats globales**          |
| **GET**     | `/admin/users`                      | **Liste paginée + filtres** |
| **PATCH**   | `/admin/users/:id/ban`              | **Ban/unban**               |
| **DELETE**  | `/admin/users/:id`                  | **Suppression**             |
| **GET**     | `/admin/startups`                   | **Liste startups**          |
| **DELETE**  | `/admin/startups/:id`               | **Suppression**             |
| **GET**     | `/admin/posts`                      | **Liste posts**             |
| **DELETE**  | `/admin/posts/:id`                  | **Suppression**             |
| **GET**     | `/admin/discussions`                | **Liste discussions**       |
| **DELETE**  | `/admin/discussions/:id`            | **Suppression**             |
| **GET**     | `/admin/waitlist`                   | **Liste waitlist**          |
| **PATCH**   | `/admin/waitlist/:id/accept`        | **Accepter**                |
| **GET**     | `/admin/spotlight`                  | **Liste**                   |
| **POST**    | `/admin/spotlight`                  | **Création**                |
| **PATCH**   | `/admin/spotlight/:id`              | **Mise à jour**             |
| **DELETE**  | `/admin/spotlight/:id`              | **Suppression**             |
| **GET**     | `/admin/datarooms`                  | **Liste (lecture seule)**   |
| **GET**     | `/admin/admin-users`                | **Liste admins**            |
| **GET**     | `/admin/roles`                      | **Liste rôles**             |
| **PATCH**   | `/admin/admin-users/:id/role`       | **Changer rôle**            |
| **PATCH**   | `/admin/admin-users/:id/superadmin` | **Toggle superadmin**       |
| **PATCH**   | `/admin/admin-users/:id/status`     | **Activer/désactiver**      |
| **GET**     | `/admin/invitations`                | **Liste invitations**       |
| **PATCH**   | `/admin/invitations/:id/revoke`     | **Révoquer invitation**     |
| **GET**     | `/admin/audit-logs`                 | **Historique**              |


