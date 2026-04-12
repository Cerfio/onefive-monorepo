# Profile Roles - Enums et Configuration

Ce dossier contient les enums et configurations liés aux **rôles de profil** dans l'écosystème Onefive.

## 🎯 Description

Les rôles de profil permettent d'identifier et de catégoriser les utilisateurs selon leur fonction dans l'écosystème startup :
- Fondateurs
- Investisseurs (BA, VC, Institutionnels)
- Mentors et Conseillers
- Services et Support
- Média et Communication
- Structures d'accompagnement

## 📁 Structure

```
profile/
├── profile-role.enum.ts     # Enum TypeScript des rôles
├── profile-role.config.ts   # Métadonnées (emojis, couleurs, labels)
├── index.ts                 # Exports centralisés
└── README.md                # Documentation
```

## 🔄 Synchronisation Backend

⚠️ **IMPORTANT** : Ces enums doivent rester synchronisés avec le backend :
- **Prisma Schema** : `onefive-back/prisma/schema/profile.prisma` (enum `ProfileRole`)
- **Configuration** : `onefive-back/src/profile/profile-role.config.ts`

## 🚀 Utilisation

### 1. Import de l'enum

```typescript
import { ProfileRole } from '@/sharing-enum/profile';

// Utilisation
const userRole: ProfileRole = ProfileRole.FOUNDER;
```

### 2. Récupérer les métadonnées d'un rôle

```typescript
import { getProfileRoleMetadata } from '@/sharing-enum/profile';

const metadata = getProfileRoleMetadata(ProfileRole.FOUNDER);
// {
//   emoji: '🚀',
//   color: '#FFD700',
//   shortLabel: 'Fondateur·rice de Startup',
//   longLabel: '...'
// }
```

### 3. Obtenir tous les rôles

```typescript
import { getAllProfileRoles } from '@/sharing-enum/profile';

const allRoles = getAllProfileRoles();
// [ProfileRole.FOUNDER, ProfileRole.BUSINESS_ANGEL, ...]
```

### 4. Obtenir tous les rôles avec métadonnées

```typescript
import { getAllProfileRolesWithMetadata } from '@/sharing-enum/profile';

const rolesWithMeta = getAllProfileRolesWithMetadata();
// [
//   { role: ProfileRole.FOUNDER, metadata: { emoji: '🚀', ... } },
//   { role: ProfileRole.BUSINESS_ANGEL, metadata: { emoji: '💰', ... } },
//   ...
// ]
```

### 5. Valider un rôle

```typescript
import { isValidProfileRole } from '@/sharing-enum/profile';

if (isValidProfileRole('FOUNDER')) {
  // C'est un rôle valide
}
```

## 🎨 Composants UI

### ProfileRoleBadge

Affiche un badge pour un rôle unique.

```tsx
import { ProfileRoleBadge } from '@/components/profile/ProfileRoleBadge';
import { ProfileRole } from '@/sharing-enum/profile';

// Variante par défaut (emoji + label court)
<ProfileRoleBadge role={ProfileRole.FOUNDER} />

// Variante compacte (emoji seul avec tooltip)
<ProfileRoleBadge role={ProfileRole.FOUNDER} variant="compact" />

// Variante complète (emoji + labels + description)
<ProfileRoleBadge role={ProfileRole.FOUNDER} variant="full" />
```

### ProfileRoleBadges

Affiche plusieurs badges avec limite optionnelle.

```tsx
import { ProfileRoleBadges } from '@/components/profile/ProfileRoleBadge';
import { ProfileRole } from '@/sharing-enum/profile';

<ProfileRoleBadges
  roles={[ProfileRole.FOUNDER, ProfileRole.MENTOR]}
  max={3} // Affiche max 3 badges + compteur
/>
```

### ProfileRoleSelector

Sélecteur de rôles pour formulaires (grille avec cartes cliquables).

```tsx
import { ProfileRoleSelector } from '@/components/profile/ProfileRoleSelector';
import { ProfileRole } from '@/sharing-enum/profile';

const [selectedRoles, setSelectedRoles] = useState<ProfileRole[]>([]);

<ProfileRoleSelector
  value={selectedRoles}
  onChange={setSelectedRoles}
  max={3} // Limite à 3 rôles maximum
/>
```

### ProfileRoleCheckboxList

Sélecteur simple sous forme de liste de checkboxes.

```tsx
import { ProfileRoleCheckboxList } from '@/components/profile/ProfileRoleSelector';
import { ProfileRole } from '@/sharing-enum/profile';

const [selectedRoles, setSelectedRoles] = useState<ProfileRole[]>([]);

<ProfileRoleCheckboxList
  value={selectedRoles}
  onChange={setSelectedRoles}
  max={3}
/>
```

## 📋 Liste des Rôles

| Rôle | Emoji | Couleur | Label Court |
|------|-------|---------|-------------|
| `FOUNDER` | 🚀 | #FFD700 | Fondateur·rice de Startup |
| `BUSINESS_ANGEL` | 💰 | #2ECC71 | Business Angel |
| `VENTURE_CAPITALIST` | 📊 | #3498DB | Venture Capitalist |
| `INSTITUTIONAL_INVESTOR` | 🏢 | #8E44AD | Investisseur Institutionnel |
| `MENTOR` | 🧑‍🏫 | #E67E22 | Mentor Startup |
| `STRATEGIC_ADVISOR` | 🧐 | #F1C40F | Conseiller Stratégique |
| `STUDENT_ENTREPRENEUR` | 📚 | #9B59B6 | Étudiant·e Entrepreneur·e |
| `SERVICE_PROVIDER` | 🔧 | #1ABC9C | Prestataire pour Startups |
| `MEDIA` | 📰 | #C0392B | Journaliste / Créateur Média |
| `INCUBATOR_ACCELERATOR` | 🏘️ | #7F8C8D | Structure d'Accompagnement |
| `RECRUITER_HR` | 🧑‍💼 | #34495E | Recruteur / RH Startup |
| `OTHER` | 👤 | #BDC3C7 | Autre Profil de l'Écosystème |

## 🔧 Modification des Rôles

Pour ajouter, modifier ou supprimer un rôle :

1. **Backend** : Modifier `onefive-back/prisma/schema/profile.prisma` et `src/profile/profile-role.config.ts`
2. **Frontend** : Modifier `profile-role.enum.ts` et `profile-role.config.ts`
3. **Migration** : Générer et appliquer la migration Prisma
   ```bash
   cd onefive-back
   npx prisma migrate dev --name update_profile_roles
   npx prisma generate
   ```

## 📝 Types TypeScript

```typescript
// Enum des rôles
enum ProfileRole {
  FOUNDER = 'FOUNDER',
  BUSINESS_ANGEL = 'BUSINESS_ANGEL',
  // ...
}

// Interface des métadonnées
interface ProfileRoleMetadata {
  emoji: string;
  color: string;
  shortLabel: string;
  longLabel: string;
}
```

## 🎯 Cas d'Usage

### Affichage du profil utilisateur
```tsx
<div className="profile-header">
  <h1>{profile.firstName} {profile.lastName}</h1>
  <ProfileRoleBadges roles={profile.roles} max={3} />
</div>
```

### Formulaire de création/édition de profil
```tsx
<form>
  <label>Sélectionnez vos rôles (max 3)</label>
  <ProfileRoleSelector
    value={formData.roles}
    onChange={(roles) => setFormData({ ...formData, roles })}
    max={3}
  />
</form>
```

### Filtrage par rôle
```tsx
const founders = profiles.filter(p => 
  p.roles.includes(ProfileRole.FOUNDER)
);
```

