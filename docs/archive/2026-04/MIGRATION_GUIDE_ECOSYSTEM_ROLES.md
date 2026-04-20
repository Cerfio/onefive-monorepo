# 🚀 Guide de Migration - Ajout du champ `ecosystemRoles`

## ⚠️ Pourquoi cette migration ?

Le champ `roles` était initialement utilisé pour **deux choses différentes** :
1. Rôles d'**administration de la plateforme** (ADMIN, SUPER_ADMIN, OWNER)
2. Rôles dans l'**écosystème startup** (Founder, VC, etc.)

Cette confusion a été corrigée en séparant les deux concepts :
- **`roles`** → Rôles admin de la plateforme (String[])
- **`ecosystemRoles`** → Rôles dans l'écosystème (ProfileRole[] enum)

## 📋 Étapes de Migration

### 1. Appliquer la Migration SQL

```bash
cd onefive-back

# Option A : Migration automatique (développement)
npx prisma migrate dev --name add_ecosystem_roles

# Option B : Migration manuelle (production)
psql -U postgres -d onefive < prisma/migrations/add_profile_roles_enum.sql
```

### 2. Régénérer le Client Prisma

```bash
npx prisma generate
```

### 3. Vérifier que les erreurs de linting ont disparu

```bash
npm run build
```

### 4. Reseed la base de données (optionnel, développement uniquement)

```bash
npx prisma db seed
```

## 📊 Schéma de Migration

### Avant
```prisma
model Profile {
  // ...
  roles String[] // Mélange admin + écosystème 😵
}
```

### Après
```prisma
model Profile {
  // ...
  roles String[] // Admin uniquement (ADMIN, SUPER_ADMIN, OWNER)
  ecosystemRoles ProfileRole[] // Écosystème uniquement ✨
}

enum ProfileRole {
  FOUNDER
  BUSINESS_ANGEL
  VENTURE_CAPITALIST
  // ... etc
}
```

## 🔄 Migration des Données Existantes

Si vous avez des données en production avec des valeurs dans `roles` qui ne sont pas admin :

```sql
-- 1. Identifier les valeurs non-admin dans roles
SELECT DISTINCT unnest(roles) as role_value
FROM "Profile"
WHERE NOT (roles <@ ARRAY['ADMIN', 'SUPER_ADMIN', 'OWNER']);

-- 2. Migrer manuellement selon vos données
-- Exemple : si vous aviez 'founder' en string
UPDATE "Profile"
SET "ecosystemRoles" = ARRAY['FOUNDER']::"ProfileRole"[]
WHERE 'founder' = ANY(roles);

-- 3. Nettoyer les valeurs non-admin de roles
UPDATE "Profile"
SET "roles" = ARRAY(
  SELECT unnest("roles")
  WHERE unnest("roles") IN ('ADMIN', 'SUPER_ADMIN', 'OWNER')
);
```

## ✅ Vérification Post-Migration

### Backend

```bash
# Démarrer le serveur
npm run start:dev

# Vérifier un profil via l'API
curl http://localhost:3000/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "...",
    "roles": [], // Admin roles (vide pour user normal)
    "ecosystemRoles": ["FOUNDER", "MENTOR"] // Nouveaux rôles écosystème
  }
}
```

### Frontend

Vérifiez que les composants fonctionnent :

```tsx
import { ProfileRoleBadges } from '@/components/profile';

// Utiliser ecosystemRoles maintenant
<ProfileRoleBadges roles={profile.ecosystemRoles} />
```

## 🚨 Problèmes Courants

### Erreur : "Module has no exported member 'ProfileRole'"

**Cause** : Migration pas encore appliquée ou client Prisma pas régénéré.

**Solution** :
```bash
npx prisma migrate dev --name add_ecosystem_roles
npx prisma generate
```

### Erreur : "Property 'ecosystemRoles' does not exist"

**Cause** : Client Prisma pas à jour.

**Solution** :
```bash
npx prisma generate
# Puis redémarrer le serveur
```

### Erreur : "column ecosystemRoles does not exist"

**Cause** : Migration pas appliquée en base de données.

**Solution** :
```bash
npx prisma migrate deploy
```

## 📝 Checklist de Migration

Backend :
- [ ] Migration SQL appliquée (`npx prisma migrate dev`)
- [ ] Client Prisma généré (`npx prisma generate`)
- [ ] Serveur redémarré
- [ ] Tests backend passent
- [ ] AdminGuard fonctionne (utilise `roles`)

Frontend :
- [ ] Imports mis à jour pour utiliser `ecosystemRoles`
- [ ] Composants de badges fonctionnent
- [ ] Affichage des profils OK
- [ ] Filtres par rôles OK

## 🎯 Points d'Attention pour le Code

### ✅ BON

```typescript
// Backend - Vérification admin
profile.roles.includes('ADMIN')

// Backend/Frontend - Rôles écosystème
profile.ecosystemRoles.includes(ProfileRole.FOUNDER)

// Frontend - Affichage badges
<ProfileRoleBadges roles={profile.ecosystemRoles} />
```

### ❌ MAUVAIS

```typescript
// Ne plus utiliser roles pour l'écosystème
profile.roles.includes('FOUNDER') // ❌

// Ne pas confondre les deux
profile.ecosystemRoles.includes('ADMIN') // ❌
```

## 📚 Documentation Complémentaire

- **Vue d'ensemble** : `PROFILE_ROLES_IMPLEMENTATION.md`
- **Distinction détaillée** : `PROFILE_ROLES_IMPORTANT_NOTE.md`
- **Liste des fichiers** : `PROFILE_ROLES_FILES.md`

---

**Date** : 5 octobre 2025  
**Version** : 2.0 (séparation des rôles)

