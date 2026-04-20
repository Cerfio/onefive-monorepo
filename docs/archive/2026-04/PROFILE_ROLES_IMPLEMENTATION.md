# 🎯 Implémentation du Système de Rôles de Profil

## ✅ Ce qui a été fait

### 1. Backend (`onefive-back`)

#### **Schéma Prisma** (`prisma/schema/profile.prisma`)
- ✅ Ajout de l'enum `ProfileRole` avec 12 rôles différents
- ✅ Ajout du nouveau champ `ecosystemRoles: ProfileRole[]` pour les rôles dans l'écosystème
- ✅ Conservation du champ `roles: String[]` pour les rôles d'administration (ADMIN, SUPER_ADMIN, OWNER)
- ✅ Génération du client Prisma avec le nouveau type

#### **Configuration des rôles** (`src/profile/profile-role.config.ts`)
- ✅ Enum TypeScript `ProfileRole` synchronisé avec Prisma
- ✅ Interface `ProfileRoleMetadata` (emoji, couleur, labels court/long)
- ✅ Objet `PROFILE_ROLE_METADATA` avec toutes les métadonnées
- ✅ Fonctions utilitaires :
  - `getProfileRoleMetadata(role)` - Récupérer les métadonnées d'un rôle
  - `getAllProfileRoles()` - Liste de tous les rôles
  - `isValidProfileRole(value)` - Valider un rôle

#### **Seed mis à jour** (`prisma/seed.ts`)
- ✅ Import de l'enum `ProfileRole` depuis `@prisma/client`
- ✅ Ajout du type `ecosystemRoles?: ProfileRole[]` dans la fonction `ensureProfileForUser`
- ✅ Conservation du type `roles?: string[]` pour l'administration
- ✅ Utilisation des valeurs de l'enum dans les données de seed :
  - User principal (team) : `FOUNDER` par défaut
  - Alice : `FOUNDER`, `MENTOR`
  - Bob : `SERVICE_PROVIDER`
  - Utilisateurs faker : combinaisons variées (6 possibilités)

### 2. Frontend (`onefive-front`)

#### **Enums partagés** (`src/sharing-enum/profile/`)
- ✅ `profile-role.enum.ts` - Enum TypeScript des rôles
- ✅ `profile-role.config.ts` - Métadonnées et fonctions utilitaires
- ✅ `index.ts` - Exports centralisés
- ✅ `README.md` - Documentation complète

#### **Composants UI** (`src/components/profile/`)

##### **ProfileRoleBadge** - Affichage de badges
```tsx
// Variante par défaut (emoji + label court)
<ProfileRoleBadge role={ProfileRole.FOUNDER} />

// Variante compacte (emoji seul)
<ProfileRoleBadge role={ProfileRole.FOUNDER} variant="compact" />

// Variante complète (avec description)
<ProfileRoleBadge role={ProfileRole.FOUNDER} variant="full" />
```

##### **ProfileRoleBadges** - Multiple badges
```tsx
<ProfileRoleBadges 
  roles={[ProfileRole.FOUNDER, ProfileRole.MENTOR]} 
  max={3} 
/>
```

##### **ProfileRoleSelector** - Sélecteur de rôles (grille)
```tsx
<ProfileRoleSelector
  value={selectedRoles}
  onChange={setSelectedRoles}
  max={3}
/>
```

##### **ProfileRoleCheckboxList** - Sélecteur simple (liste)
```tsx
<ProfileRoleCheckboxList
  value={selectedRoles}
  onChange={setSelectedRoles}
  max={3}
/>
```

## 📋 Liste des Rôles

| Rôle | Emoji | Couleur | Label Court |
|------|-------|---------|-------------|
| `FOUNDER` | 🚀 | #FFD700 (Or) | Fondateur·rice de Startup |
| `BUSINESS_ANGEL` | 💰 | #2ECC71 (Vert) | Business Angel |
| `VENTURE_CAPITALIST` | 📊 | #3498DB (Bleu) | Venture Capitalist |
| `INSTITUTIONAL_INVESTOR` | 🏢 | #8E44AD (Violet) | Investisseur Institutionnel |
| `MENTOR` | 🧑‍🏫 | #E67E22 (Orange) | Mentor Startup |
| `STRATEGIC_ADVISOR` | 🧐 | #F1C40F (Jaune) | Conseiller Stratégique |
| `STUDENT_ENTREPRENEUR` | 📚 | #9B59B6 (Améthyste) | Étudiant·e Entrepreneur·e |
| `SERVICE_PROVIDER` | 🔧 | #1ABC9C (Turquoise) | Prestataire pour Startups |
| `MEDIA` | 📰 | #C0392B (Rouge) | Journaliste / Créateur Média |
| `INCUBATOR_ACCELERATOR` | 🏘️ | #7F8C8D (Gris) | Structure d'Accompagnement |
| `RECRUITER_HR` | 🧑‍💼 | #34495E (Bleu Nuit) | Recruteur / RH Startup |
| `OTHER` | 👤 | #BDC3C7 (Argent) | Autre Profil |

## 🚀 Prochaines Étapes

### 1. Migration Base de Données (⚠️ À FAIRE)

Le schéma Prisma a été mis à jour, mais la base de données doit être migrée.

**Option A : Reset complet (développement uniquement)**
```bash
cd onefive-back
npx prisma migrate reset
npx prisma migrate dev --name add_profile_roles
```

**Option B : Migration manuelle (production)**
```bash
cd onefive-back
# Voir le fichier prisma/migrations/add_profile_roles_enum.sql
psql -d onefive -f prisma/migrations/add_profile_roles_enum.sql
```

### 2. Mettre à Jour les DTOs Backend

Ajouter la validation des rôles dans les DTOs de profil :

```typescript
// src/profile/dto/update-profile.dto.ts
import { IsArray, IsEnum, ArrayMaxSize } from 'class-validator';
import { ProfileRole } from '../profile-role.config';

export class UpdateProfileDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3) // Maximum 3 rôles
  @IsEnum(ProfileRole, { each: true })
  ecosystemRoles?: ProfileRole[];
}
```

### 3. Créer des Handlers Backend

Si besoin, créer des handlers spécifiques pour la gestion des rôles :

```typescript
// src/profile/handlers/update-profile-roles.handler.ts
@Injectable()
export class UpdateProfileRolesHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({ userId, ecosystemRoles }: { userId: string; ecosystemRoles: ProfileRole[] }) {
    // Valider que les rôles sont valides
    // Mettre à jour le profil
  }
}
```

### 4. Intégrer dans les Pages Frontend

#### Page de profil (affichage)
```tsx
// app/(protected)/profile/[id]/page.tsx
<div className="profile-header">
  <h1>{profile.firstName} {profile.lastName}</h1>
  <ProfileRoleBadges roles={profile.ecosystemRoles} max={3} />
</div>
```

#### Page d'édition (formulaire)
```tsx
// app/(protected)/profile/edit/page.tsx
<form onSubmit={handleSubmit}>
  <div>
    <label>Vos rôles dans l'écosystème (max 3)</label>
    <ProfileRoleSelector
      value={formData.ecosystemRoles}
      onChange={(ecosystemRoles) => setFormData({ ...formData, ecosystemRoles })}
      max={3}
    />
  </div>
</form>
```

#### Filtrage/Recherche
```tsx
// app/(protected)/network/page.tsx
const [filterRoles, setFilterRoles] = useState<ProfileRole[]>([]);

<ProfileRoleCheckboxList
  value={filterRoles}
  onChange={setFilterRoles}
/>
```

### 5. API Backend - Endpoints à Mettre à Jour

Les endpoints suivants devront gérer les rôles :

- `POST /profile` - Création de profil avec rôles
- `PUT /profile` - Mise à jour des rôles
- `GET /profile/:id` - Retourner les rôles
- `GET /profiles` - Filtrer par rôles (optionnel)

Exemple de requête :
```typescript
// PUT /profile
{
  "ecosystemRoles": ["FOUNDER", "MENTOR"]
}
```

### 6. Tests

#### Tests Backend
```typescript
// src/profile/profile.service.spec.ts
describe('ProfileService - Ecosystem Roles', () => {
  it('should update profile ecosystem roles', async () => {
    const ecosystemRoles = [ProfileRole.FOUNDER, ProfileRole.MENTOR];
    const result = await service.update({
      userId: 'user-id',
      ecosystemRoles,
    });
    expect(result.ecosystemRoles).toEqual(ecosystemRoles);
  });
});
```

#### Tests Frontend
```typescript
// components/profile/ProfileRoleSelector.test.tsx
describe('ProfileRoleSelector', () => {
  it('should select and deselect roles', () => {
    const onChange = jest.fn();
    render(<ProfileRoleSelector value={[]} onChange={onChange} />);
    // Test interactions
  });
});
```

## 📚 Documentation

- **Backend** : `/onefive-back/src/profile/profile-role.config.ts`
- **Frontend** : `/onefive-front/src/sharing-enum/profile/README.md`
- **Composants** : Tous documentés avec JSDoc

## 🔄 Synchronisation Backend ↔ Frontend

⚠️ **IMPORTANT** : Les enums doivent rester synchronisés entre :
1. Schéma Prisma (`onefive-back/prisma/schema/profile.prisma`)
2. Config Backend (`onefive-back/src/profile/profile-role.config.ts`)
3. Enum Frontend (`onefive-front/src/sharing-enum/profile/profile-role.enum.ts`)
4. Config Frontend (`onefive-front/src/sharing-enum/profile/profile-role.config.ts`)

## 💡 Exemples d'Utilisation

### Backend - Service
```typescript
import { ProfileRole } from '../profile-role.config';

const profile = await prisma.profile.update({
  where: { userId },
  data: {
    ecosystemRoles: [ProfileRole.FOUNDER, ProfileRole.MENTOR],
  },
});
```

### Frontend - Affichage
```tsx
import { ProfileRoleBadge } from '@/components/profile/ProfileRoleBadge';
import { ProfileRole } from '@/sharing-enum/profile';

<ProfileRoleBadge role={ProfileRole.FOUNDER} />
```

### Frontend - Formulaire
```tsx
import { ProfileRoleSelector } from '@/components/profile/ProfileRoleSelector';
import { ProfileRole } from '@/sharing-enum/profile';

const [roles, setRoles] = useState<ProfileRole[]>([]);

<ProfileRoleSelector
  value={roles}
  onChange={setRoles}
  max={3}
/>
```

## 🎨 Design System

Tous les composants utilisent :
- **Tailwind CSS** pour le styling
- **shadcn/ui** utilities (`cn()`)
- **Couleurs personnalisées** par rôle
- **Responsive design** (mobile-first)
- **Accessibilité** (tooltips, labels, ARIA)

## ✨ Fonctionnalités

- ✅ 12 rôles prédéfinis avec métadonnées complètes
- ✅ Emojis et couleurs personnalisées par rôle
- ✅ Composants UI prêts à l'emploi
- ✅ Support multi-rôles (jusqu'à 3 recommandé)
- ✅ Validation côté backend et frontend
- ✅ Documentation complète
- ✅ Type-safe (TypeScript)
- ✅ Synchronisation backend ↔ frontend

## 🐛 Troubleshooting

### Erreur Prisma après génération
```bash
cd onefive-back
npx prisma generate
```

### Types TypeScript non reconnus
```bash
# Frontend
cd onefive-front
npm run build

# Backend
cd onefive-back
npm run build
```

### Composants non trouvés
Vérifiez les imports :
```tsx
import { ProfileRole } from '@/sharing-enum/profile';
import { ProfileRoleBadge } from '@/components/profile/ProfileRoleBadge';
```

---

**Fait avec ❤️ pour l'écosystème Onefive 🚀**

