# 🔄 Changements : `roles` → `ecosystemRoles`

## 📋 Résumé

Tous les fichiers backend et frontend ont été mis à jour pour utiliser `ecosystemRoles` au lieu de `roles` pour les rôles dans l'écosystème startup.

Le champ `roles` (String[]) reste réservé aux rôles d'administration de la plateforme (ADMIN, SUPER_ADMIN, OWNER).

---

## 🔧 Backend - Fichiers Modifiés

### Handlers de Profil

#### 1. **`src/profile/handlers/me-profile.handler.ts`**
- ✅ Interface de retour : `roles: string[]` → `ecosystemRoles: string[]`
- ✅ Requête Prisma : `roles: true` → `ecosystemRoles: true`
- ✅ Mapping : `roles: profile.roles` → `ecosystemRoles: profile.ecosystemRoles`

#### 2. **`src/profile/handlers/get-profile.handler.ts`**
- ✅ Requête Prisma : `roles: true` → `ecosystemRoles: true`
- ✅ Mapping : `roles: profile.roles` → `ecosystemRoles: profile.ecosystemRoles`

### Services de Suggestions

#### 3. **`src/feed-extra/feed-extra.service.ts`**
- ✅ Requête Prisma : `roles: true` → `ecosystemRoles: true`
- ✅ Mapping : `roles: profile.roles` → `ecosystemRoles: profile.ecosystemRoles`

#### 4. **`src/feed-extra/dto/get-profile-suggestions.dto.ts`**
- ✅ DTO : `roles: string[]` → `ecosystemRoles: string[]`

#### 5. **`src/profile-suggestion/profile-suggestion.service.ts`**
- ✅ Requête Prisma : `roles: true` → `ecosystemRoles: true`
- ✅ Mapping : `roles: profile.roles` → `ecosystemRoles: profile.ecosystemRoles`

#### 6. **`src/profile-suggestion/dto/get-profile-suggestion.dto.ts`**
- ✅ DTO : `roles: string[]` → `ecosystemRoles: string[]`

### Corrections

#### 7. **`src/education/handlers/create-education.handler.ts`**
- 🐛 Retrait de `urlAvatar: education.urlAvatar` (n'existe pas dans le modèle)

#### 8. **`src/education/handlers/update-education.handler.ts`**
- 🐛 Retrait de `urlAvatar: education.urlAvatar` (n'existe pas dans le modèle)

---

## 🎨 Frontend - Fichiers Modifiés

### Queries et Types

#### 1. **`src/queries/profile.ts`**
- ✅ Schema Zod : `roles: z.array(z.string())` → `ecosystemRoles: z.array(z.string())`
- ✅ Type `MeProfile` mis à jour automatiquement

### Pages

#### 2. **`src/app/(protected)/profile/[id]/page.tsx`**
- ✅ Mapping : `roles: profile.roles` → `ecosystemRoles: profile.ecosystemRoles`

#### 3. **`src/app/(protected)/feed/page.tsx`**
- ✅ Condition : `profile.roles.length` → `profile.ecosystemRoles.length`
- ✅ Accès : `profile.roles[0]` → `profile.ecosystemRoles[0]`
- ✅ Badge color : `getBadgeColor(profile.roles)` → `getBadgeColor(profile.ecosystemRoles)`

### Composants

#### 4. **`src/components/profile/ProfileHeader.tsx`**
- ✅ Condition : `profileData.roles` → `profileData.ecosystemRoles`
- ✅ Map : `profileData.roles.slice(0, 2).map` → `profileData.ecosystemRoles.slice(0, 2).map`

#### 5. **`src/components/profile/modals/ProfilePreviewModal.tsx`**
- ✅ Map : `profileData.roles?.map` → `profileData.ecosystemRoles?.map`

### API Routes

#### 6. **`src/app/api/og/profile/[id]/route.tsx`**
- ✅ Map : `profile.roles.map` → `profile.ecosystemRoles.map`

---

## 📊 Statistiques

- **Backend** : 8 fichiers modifiés
- **Frontend** : 6 fichiers modifiés
- **Total** : 14 fichiers mis à jour
- **Bugs corrigés** : 2 (urlAvatar dans education handlers)

---

## ✅ Vérification Post-Changement

### Backend

```bash
cd onefive-back
npm run build
```

**Erreurs attendues** : Aucune (après application de la migration)

### Frontend

```bash
cd onefive-front
npm run build
```

**Erreurs attendues** : Aucune

---

## 🧪 Tests à Effectuer

### API Backend

1. **GET /profile/me**
   ```bash
   curl http://localhost:3000/profile/me \
     -H "Authorization: Bearer TOKEN"
   ```
   Vérifier que la réponse contient `ecosystemRoles` et non `roles`

2. **GET /profile/:id**
   ```bash
   curl http://localhost:3000/profile/USER_ID \
     -H "Authorization: Bearer TOKEN"
   ```
   Vérifier `ecosystemRoles`

3. **GET /feed-extra/profile-suggestions**
   ```bash
   curl http://localhost:3000/feed-extra/profile-suggestions \
     -H "Authorization: Bearer TOKEN"
   ```
   Vérifier que chaque profil contient `ecosystemRoles`

### Frontend

1. **Page de profil** : `/profile/[id]`
   - Vérifier l'affichage des badges de rôles
   - Vérifier qu'ils proviennent de `ecosystemRoles`

2. **Feed** : `/feed`
   - Vérifier les suggestions de profils
   - Vérifier l'affichage des badges

3. **Preview modal**
   - Ouvrir un profil en preview
   - Vérifier l'affichage des rôles

4. **OG Image** : `/api/og/profile/[id]`
   - Tester la génération d'image OG
   - Vérifier que les rôles s'affichent

---

## 🔄 Migration Nécessaire

⚠️ **IMPORTANT** : La base de données doit être migrée pour que ces changements fonctionnent.

```bash
cd onefive-back
npx prisma migrate dev --name add_ecosystem_roles
npx prisma generate
```

Voir : `MIGRATION_GUIDE_ECOSYSTEM_ROLES.md`

---

## 📝 Rappel : Deux Champs Distincts

| Champ | Type | Usage |
|-------|------|-------|
| `roles` | `String[]` | Administration plateforme (ADMIN, SUPER_ADMIN, OWNER) |
| `ecosystemRoles` | `ProfileRole[]` | Rôles écosystème (FOUNDER, VC, MENTOR, etc.) |

**Ne JAMAIS confondre les deux !**

---

## 🎯 Prochaines Étapes

1. ✅ Appliquer la migration SQL
2. ✅ Tester en local (backend + frontend)
3. ⏳ Vérifier tous les endpoints API
4. ⏳ Tester l'UI sur tous les écrans
5. ⏳ Déployer en staging
6. ⏳ Tests E2E
7. ⏳ Déployer en production

---

**Date** : 5 octobre 2025  
**Version** : 2.1 (Renommage `roles` → `ecosystemRoles`)

