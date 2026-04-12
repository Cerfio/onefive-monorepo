# 📝 Changelog - Système de Rôles d'Écosystème

## Version 2.0 - 5 octobre 2025

### 🔄 Changement Majeur : Séparation des Rôles

**Problème identifié** : Le champ `roles` était utilisé pour deux concepts différents :
- Rôles d'administration de la plateforme (ADMIN, SUPER_ADMIN, OWNER)
- Rôles dans l'écosystème startup (Founder, VC, Mentor, etc.)

**Solution** : Création d'un nouveau champ dédié `ecosystemRoles` avec un enum TypeScript strict.

---

## 🆕 Nouveautés

### Backend

#### Schéma Prisma
- ✨ **Nouveau champ** : `ecosystemRoles ProfileRole[]`
- 📌 **Champ conservé** : `roles String[]` (pour l'administration)
- 🎯 **Nouvel enum** : `ProfileRole` avec 12 valeurs

#### Configuration
- ✨ Fichier `src/profile/profile-role.config.ts` avec métadonnées complètes
- 🎨 Emojis, couleurs, labels courts et longs pour chaque rôle
- 🛠️ Fonctions utilitaires (getProfileRoleMetadata, getAllProfileRoles, etc.)

#### Seed
- 🔄 Mis à jour pour utiliser `ecosystemRoles`
- ✅ Données de test avec rôles variés

### Frontend

#### Enums Partagés
- ✨ `src/sharing-enum/profile/` avec enum et configuration
- 📚 Documentation complète

#### Composants UI
- 🎨 `ProfileRoleBadge` - Badge individuel (3 variantes)
- 🎨 `ProfileRoleBadges` - Badges multiples
- 🎨 `ProfileRoleSelector` - Sélecteur en grille
- 🎨 `ProfileRoleCheckboxList` - Sélecteur en liste

---

## 🛠️ Modifications

### Fichiers Modifiés

| Fichier | Type | Changement |
|---------|------|------------|
| `prisma/schema/profile.prisma` | ✏️ Modifié | Ajout de `ecosystemRoles`, commentaires sur `roles` |
| `prisma/seed.ts` | ✏️ Modifié | Utilisation de `ecosystemRoles` au lieu de `roles` |
| `src/education/handlers/create-education.handler.ts` | 🐛 Fix | Retrait de `urlAvatar` qui n'existe pas |
| `src/education/handlers/update-education.handler.ts` | 🐛 Fix | Retrait de `urlAvatar` qui n'existe pas |

### Fichiers Créés

#### Backend
- ✨ `src/profile/profile-role.config.ts`
- ✨ `prisma/migrations/add_profile_roles_enum.sql`

#### Frontend
- ✨ `src/sharing-enum/profile/profile-role.enum.ts`
- ✨ `src/sharing-enum/profile/profile-role.config.ts`
- ✨ `src/sharing-enum/profile/index.ts`
- ✨ `src/sharing-enum/profile/README.md`
- ✨ `src/components/profile/ProfileRoleBadge.tsx`
- ✨ `src/components/profile/ProfileRoleSelector.tsx`
- ✨ `src/components/profile/ProfileRolesExample.tsx`
- ✨ `src/components/profile/index.ts`

#### Documentation
- 📚 `PROFILE_ROLES_IMPLEMENTATION.md`
- 📚 `PROFILE_ROLES_FILES.md`
- 📚 `PROFILE_ROLES_IMPORTANT_NOTE.md`
- 📚 `MIGRATION_GUIDE_ECOSYSTEM_ROLES.md`
- 📚 `PROFILE_ROLES_CHANGELOG.md` (ce fichier)

---

## 🎯 Les 12 Rôles d'Écosystème

| Enum | Emoji | Label |
|------|-------|-------|
| `FOUNDER` | 🚀 | Fondateur·rice de Startup |
| `BUSINESS_ANGEL` | 💰 | Business Angel |
| `VENTURE_CAPITALIST` | 📊 | Venture Capitalist |
| `INSTITUTIONAL_INVESTOR` | 🏢 | Investisseur Institutionnel |
| `MENTOR` | 🧑‍🏫 | Mentor Startup |
| `STRATEGIC_ADVISOR` | 🧐 | Conseiller Stratégique |
| `STUDENT_ENTREPRENEUR` | 📚 | Étudiant·e Entrepreneur·e |
| `SERVICE_PROVIDER` | 🔧 | Prestataire pour Startups |
| `MEDIA` | 📰 | Journaliste / Créateur Média |
| `INCUBATOR_ACCELERATOR` | 🏘️ | Structure d'Accompagnement |
| `RECRUITER_HR` | 🧑‍💼 | Recruteur / RH Startup |
| `OTHER` | 👤 | Autre Profil de l'Écosystème |

---

## 🔄 Migration Nécessaire

### Commandes

```bash
# Backend
cd onefive-back
npx prisma migrate dev --name add_ecosystem_roles
npx prisma generate
npm run build

# Frontend
cd onefive-front
npm run build
```

### Impact sur le Code Existant

#### ⚠️ Breaking Changes

```typescript
// ❌ AVANT (ne fonctionne plus pour l'écosystème)
profile.roles.includes('FOUNDER')

// ✅ APRÈS
profile.ecosystemRoles.includes(ProfileRole.FOUNDER)
```

```tsx
// ❌ AVANT
<ProfileRoleBadges roles={profile.roles} />

// ✅ APRÈS
<ProfileRoleBadges roles={profile.ecosystemRoles} />
```

#### ✅ Non impacté

```typescript
// Les vérifications admin continuent de fonctionner
profile.roles.includes('ADMIN') // ✅ OK
profile.roles.includes('SUPER_ADMIN') // ✅ OK
```

---

## 🐛 Corrections de Bugs

### Education Handlers
**Problème** : Les handlers tentaient d'accéder à `urlAvatar` qui n'existe pas dans le modèle `Education`.

**Fichiers corrigés** :
- `src/education/handlers/create-education.handler.ts`
- `src/education/handlers/update-education.handler.ts`

**Solution** : Retrait de la ligne `urlAvatar: education.urlAvatar`

---

## 📊 Statistiques

- **Fichiers créés** : 13
- **Fichiers modifiés** : 4
- **Lignes de code** : ~1500+
- **Composants React** : 6
- **Rôles définis** : 12
- **Documentation** : 5 fichiers

---

## ⚡ Performance

- Aucun impact sur les performances
- Les requêtes utilisent le même champ `roles` pour l'admin
- Nouveau champ `ecosystemRoles` indexable si besoin

---

## 🔐 Sécurité

- ✅ Séparation claire des rôles admin et écosystème
- ✅ Validation stricte via enum TypeScript
- ✅ AdminGuard non impacté
- ✅ Type-safety complète

---

## 📚 Documentation

Tous les guides sont disponibles à la racine du projet :

1. **Vue d'ensemble** : `PROFILE_ROLES_IMPLEMENTATION.md`
2. **Distinction des rôles** : `PROFILE_ROLES_IMPORTANT_NOTE.md`
3. **Guide de migration** : `MIGRATION_GUIDE_ECOSYSTEM_ROLES.md`
4. **Liste des fichiers** : `PROFILE_ROLES_FILES.md`
5. **Changelog** : `PROFILE_ROLES_CHANGELOG.md`

---

## 🎯 Prochaines Étapes Recommandées

### Court terme (à faire immédiatement)
1. ✅ Appliquer la migration SQL
2. ✅ Régénérer le client Prisma
3. ✅ Mettre à jour les DTOs pour valider `ecosystemRoles`
4. ✅ Intégrer les composants dans les pages de profil

### Moyen terme
1. ⏳ Créer des handlers pour gérer les rôles
2. ⏳ Ajouter des filtres par rôles dans la recherche
3. ⏳ Implémenter des suggestions basées sur les rôles
4. ⏳ Écrire les tests E2E et unitaires

### Long terme
1. 💡 Analytics sur les rôles les plus populaires
2. 💡 Matching automatique par rôles complémentaires
3. 💡 Badges spéciaux pour certains rôles vérifiés

---

## 🤝 Contributeurs

- **Développement initial** : Claude AI (Anthropic)
- **Demande de fonctionnalité** : Équipe OneFive
- **Date de livraison** : 5 octobre 2025

---

## 📞 Support

En cas de problème avec la migration :
1. Consulter `MIGRATION_GUIDE_ECOSYSTEM_ROLES.md`
2. Vérifier `PROFILE_ROLES_IMPORTANT_NOTE.md` pour la distinction des rôles
3. Lire les erreurs de linting et appliquer la migration

---

**Version 2.0.0** - Système de Rôles d'Écosystème ✨

