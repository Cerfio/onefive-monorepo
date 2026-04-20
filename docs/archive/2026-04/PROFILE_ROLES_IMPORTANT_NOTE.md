# ⚠️ IMPORTANT - Distinction entre les deux types de rôles

## 🔑 Concept Clé : Deux champs distincts

Le modèle `Profile` contient maintenant **DEUX champs de rôles différents** :

### 1. `roles` (String[]) - Rôles d'Administration de la Plateforme

**Utilité** : Gestion des permissions administratives sur la plateforme OneFive elle-même.

**Valeurs possibles** :
- `'ADMIN'` - Administrateur avec droits de gestion
- `'SUPER_ADMIN'` - Super administrateur avec tous les droits
- `'OWNER'` - Propriétaire de la plateforme

**Utilisation** :
- Utilisé par `AdminGuard` pour restreindre l'accès aux endpoints admin
- Gère les permissions internes de la plateforme
- Généralement vide pour les utilisateurs normaux

```typescript
// Exemple dans AdminGuard
const hasAdminRole = profile.roles.some(
  (role) => role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER',
);
```

### 2. `ecosystemRoles` (ProfileRole[]) - Rôles dans l'Écosystème Startup

**Utilité** : Identifier le rôle de l'utilisateur dans l'écosystème entrepreneurial.

**Valeurs possibles** (enum `ProfileRole`) :
- `FOUNDER` - Fondateur·rice de Startup
- `BUSINESS_ANGEL` - Business Angel
- `VENTURE_CAPITALIST` - Venture Capitalist
- `INSTITUTIONAL_INVESTOR` - Investisseur Institutionnel
- `MENTOR` - Mentor Startup
- `STRATEGIC_ADVISOR` - Conseiller Stratégique
- `STUDENT_ENTREPRENEUR` - Étudiant·e Entrepreneur·e
- `SERVICE_PROVIDER` - Prestataire pour Startups
- `MEDIA` - Journaliste / Créateur Média
- `INCUBATOR_ACCELERATOR` - Structure d'Accompagnement
- `RECRUITER_HR` - Recruteur / RH Startup
- `OTHER` - Autre Profil

**Utilisation** :
- Affichage de badges sur les profils
- Filtrage et recherche d'utilisateurs
- Suggestions de connexions
- Personnalisation de l'expérience utilisateur

```typescript
// Exemple d'utilisation
const profile = await prisma.profile.findUnique({
  where: { id: profileId },
  select: {
    roles: true, // Rôles admin
    ecosystemRoles: true, // Rôles écosystème
  },
});

// Affichage des badges
<ProfileRoleBadges roles={profile.ecosystemRoles} />
```

## 📋 Exemples Concrets

### Utilisateur Normal (Fondateur)
```typescript
{
  roles: [], // Pas de rôle admin
  ecosystemRoles: [ProfileRole.FOUNDER], // Fondateur dans l'écosystème
}
```

### Administrateur qui est aussi Investisseur
```typescript
{
  roles: ['ADMIN'], // Admin de la plateforme
  ecosystemRoles: [ProfileRole.VENTURE_CAPITALIST], // VC dans l'écosystème
}
```

### Super Admin avec plusieurs rôles écosystème
```typescript
{
  roles: ['SUPER_ADMIN'], // Super admin de la plateforme
  ecosystemRoles: [
    ProfileRole.FOUNDER,
    ProfileRole.MENTOR,
    ProfileRole.BUSINESS_ANGEL
  ], // Plusieurs rôles dans l'écosystème
}
```

## 🚫 À NE PAS FAIRE

❌ **Confondre les deux champs**
```typescript
// MAUVAIS
profile.roles.includes(ProfileRole.FOUNDER)
```

✅ **Utiliser le bon champ**
```typescript
// BON
profile.ecosystemRoles.includes(ProfileRole.FOUNDER)
```

❌ **Utiliser l'enum pour les rôles admin**
```typescript
// MAUVAIS
profile.roles.includes(ProfileRole.ADMIN) // ProfileRole.ADMIN n'existe pas !
```

✅ **Utiliser des strings pour les rôles admin**
```typescript
// BON
profile.roles.includes('ADMIN')
```

## 🔄 Migration des Données Existantes

Si vous avez des données existantes dans `roles` qui sont des rôles d'écosystème :

```sql
-- Migrer les anciennes valeurs vers ecosystemRoles
UPDATE "Profile"
SET "ecosystemRoles" = CASE
  WHEN 'founder' = ANY("roles") THEN ARRAY['FOUNDER']::"ProfileRole"[]
  -- Ajouter d'autres mappings...
  ELSE ARRAY[]::"ProfileRole"[]
END;

-- Nettoyer les anciennes valeurs non-admin de roles
UPDATE "Profile"
SET "roles" = ARRAY(
  SELECT unnest("roles")
  WHERE unnest("roles") IN ('ADMIN', 'SUPER_ADMIN', 'OWNER')
);
```

## 📝 Checklist pour les Développeurs

Lors de l'implémentation d'une nouvelle fonctionnalité impliquant des rôles :

- [ ] Ai-je besoin de vérifier les **permissions admin** ? → Utiliser `roles`
- [ ] Ai-je besoin de connaître le **rôle dans l'écosystème** ? → Utiliser `ecosystemRoles`
- [ ] Ai-je bien utilisé l'**enum TypeScript** pour `ecosystemRoles` ?
- [ ] Ai-je bien utilisé des **strings** pour `roles` ?
- [ ] Les tests couvrent-ils les deux types de rôles si nécessaire ?

## 🎯 Résumé

| Aspect | `roles` (Admin) | `ecosystemRoles` (Écosystème) |
|--------|----------------|-------------------------------|
| **Type** | `String[]` | `ProfileRole[]` (enum) |
| **Valeurs** | 'ADMIN', 'SUPER_ADMIN', 'OWNER' | FOUNDER, BUSINESS_ANGEL, VC, etc. |
| **Usage principal** | Permissions plateforme | Profil utilisateur public |
| **Affichage UI** | Non affiché publiquement | Badges sur le profil |
| **Filtrage/Recherche** | Non | Oui |
| **Généralement** | Vide pour la plupart des users | Au moins 1 rôle recommandé |

---

**Date de mise à jour** : 5 octobre 2025  
**Version** : 2.0 (après séparation des rôles)

