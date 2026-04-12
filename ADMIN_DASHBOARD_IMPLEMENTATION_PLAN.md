# 🎯 Plan d'Implémentation : Admin Dashboard Waitlist

> **Date** : 8 février 2026  
> **Cible** : `onefive-front` (admin intégré à l'app principale)  
> **Backend** : `onefive-back` (nouveaux endpoints admin)  
> **Séparation** : `onefive-bo` reste pour la landing page uniquement

---

## 📊 Architecture Recommandée

### Pourquoi dans `onefive-front` et pas `onefive-bo` ?

| Critère | onefive-front (App Admin) | onefive-bo (Payload CMS) |
|---------|---------------------------|--------------------------|
| **Purpose** | Gérer les **vrais users** de l'app | Gérer la **landing page** (pré-inscription) |
| **Database** | PostgreSQL Prisma (onefive-back) | PostgreSQL Payload (separate schema) |
| **Waitlist** | Users WAITING/ACTIVE avec profils | Emails pré-inscription (avant signup) |
| **Auth** | Sessions OneFive (SessionGuard) | Payload auth (séparé) |
| **Complexité** | Simple : ajouter routes /admin | Complexe : sync 2 DB, collections custom |

**Décision** : ✅ **Créer l'admin dans `onefive-front`**

---

## 🏗️ Structure de Fichiers

### Frontend (`onefive-front`)

```
src/app/(admin)/
├── admin/
│   ├── layout.tsx                        # Layout admin avec AdminGuard
│   ├── page.tsx                          # Dashboard principal (stats globales)
│   │
│   ├── waitlist/
│   │   ├── page.tsx                      # Page liste waitlist
│   │   └── components/
│   │       ├── WaitlistTable.tsx         # Table users WAITING/ACTIVE
│   │       ├── WaitlistFilters.tsx       # Filters (status, search)
│   │       ├── UserRow.tsx               # Ligne user (position, actions)
│   │       ├── BulkActivationModal.tsx   # Modal bulk activation
│   │       ├── ActivateUserModal.tsx     # Modal activation individuelle
│   │       └── WaitlistStats.tsx         # Stats (total, waiting, active)
│   │
│   └── ambassadors/
│       ├── page.tsx                      # Page gestion ambassadeurs
│       └── components/
│           ├── AmbassadorList.tsx        # Liste ambassadeurs
│           ├── AmbassadorCard.tsx        # Card ambassadeur avec stats
│           ├── CreateAmbassadorModal.tsx # Modal création ambassadeur
│           └── EditAmbassadorModal.tsx   # Modal édition ambassadeur

src/queries/
├── admin.ts                              # Queries React Query pour admin

src/guards/
├── AdminGuard.tsx                        # Guard pour protéger routes admin
```

---

### Backend (`onefive-back`)

```
src/admin/
├── admin.module.ts                       # Module admin
├── admin.controller.ts                   # Controller admin
├── admin.service.ts                      # Service admin
├── admin.guard.ts                        # Guard admin (vérifier role)
│
├── dto/
│   ├── bulk-activate.dto.ts              # DTO bulk activation
│   ├── create-ambassador.dto.ts          # DTO création ambassadeur
│   ├── update-ambassador.dto.ts          # DTO update ambassadeur
│   └── admin-waitlist-filters.dto.ts     # DTO filters waitlist
│
└── handlers/
    ├── get-waitlist-users.handler.ts     # Liste users waitlist
    ├── activate-user.handler.ts          # Activer un user
    ├── bulk-activate-users.handler.ts    # Bulk activation
    ├── get-ambassadors.handler.ts        # Liste ambassadeurs
    ├── create-ambassador.handler.ts      # Créer ambassadeur
    ├── update-ambassador.handler.ts      # Update ambassadeur
    └── delete-ambassador.handler.ts      # Supprimer ambassadeur
```

---

## 🔐 Système de Rôles Admin

### Ajout du Rôle Admin dans Profile

**Migration Prisma** :

```prisma
// prisma/schema/profile.prisma

enum ProfileRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model Profile {
  // ... autres champs
  role ProfileRole @default(USER)
}
```

**AdminGuard** :

```typescript
// onefive-back/src/admin/admin.guard.ts

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId; // Depuis SessionGuard

    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { role: true },
    });

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

---

## 📡 Endpoints Backend Admin

### 1. Waitlist Management

#### `GET /admin/waitlist`
**Description** : Liste des users en waitlist avec pagination et filters

**Query Params** :
- `status` : WAITING | ACTIVE | ALL
- `search` : Email / nom / prénom
- `page` : Numéro de page
- `limit` : Nombre de résultats (default: 50)
- `orderBy` : position | createdAt | referralCount
- `order` : asc | desc

**Response** :
```typescript
{
  success: true,
  data: {
    users: [
      {
        id: string,
        firstName: string,
        lastName: string,
        email: string,
        waitlistStatus: 'WAITING' | 'ACTIVE',
        position: number,
        referralCount: number,
        createdAt: string,
        activatedAt: string | null,
        referrerType: 'AMBASSADOR' | 'USER' | null,
      }
    ],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
    },
    stats: {
      total: number,
      waiting: number,
      active: number,
    }
  }
}
```

---

#### `POST /admin/waitlist/activate/:profileId`
**Description** : Activer un profil manuellement

**Response** :
```typescript
{
  success: true,
  data: {
    profileId: string,
    status: 'ACTIVE',
    activatedAt: string,
  }
}
```

---

#### `POST /admin/waitlist/bulk-activate`
**Description** : Activer les X prochains utilisateurs en WAITING

**Body** :
```typescript
{
  count: number, // Nombre d'users à activer (ex: 50)
}
```

**Response** :
```typescript
{
  success: true,
  data: {
    activated: [
      { id: string, firstName: string, lastName: string, email: string }
    ],
    count: number,
  }
}
```

**Logique** :
1. Query les X premiers users WAITING (triés par referralCount DESC, createdAt ASC)
2. Pour chaque user : `waitlistService.activateProfile(profileId)`
3. Trigger email "Compte Activé"
4. Trigger badge "Early Adopter" si count(ACTIVE) <= 500

---

### 2. Ambassador Management

#### `GET /admin/ambassadors`
**Description** : Liste des ambassadeurs avec leurs stats

**Response** :
```typescript
{
  success: true,
  data: [
    {
      id: string,
      profileId: string,
      name: string,
      title: string,
      bio: string,
      interviewUrl: string | null,
      avatarUrl: string | null,
      isActive: boolean,
      invitationCount: number, // Nombre d'invitations converties
      createdAt: string,
    }
  ]
}
```

---

#### `POST /admin/ambassadors`
**Description** : Créer un nouvel ambassadeur

**Body** :
```typescript
{
  profileId: string,      // ID du profil à promouvoir ambassadeur
  name: string,
  title: string,
  bio?: string,
  interviewUrl?: string,
  avatarUrl?: string,
}
```

**Response** :
```typescript
{
  success: true,
  data: {
    id: string,
    profileId: string,
    name: string,
    // ...
  }
}
```

**Logique** :
1. Vérifier que le profil existe
2. Créer l'ambassadeur
3. Assigner le badge "AMBASSADOR" (via UserBadge)

---

#### `PUT /admin/ambassadors/:id`
**Description** : Mettre à jour un ambassadeur

**Body** : Mêmes champs que POST + `isActive`

---

#### `DELETE /admin/ambassadors/:id`
**Description** : Supprimer un ambassadeur (soft delete via `isActive = false` recommandé)

---

#### `GET /admin/ambassador/by-code/:code`
**Description** : Récupérer les infos d'un ambassadeur par son referralCode (pour bannière signup)

**Response** :
```typescript
{
  success: true,
  data: {
    name: string,
    title: string,
    bio: string,
    interviewUrl: string | null,
    avatarUrl: string | null,
  }
}
```

---

## 🎨 UI/UX Admin Dashboard

### Page `/admin/waitlist`

#### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ Admin - Waitlist Management                          [Yannis]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Stats Cards Row]                                             │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│ │  Total  │  │ Waiting │  │ Active  │  │ Taux    │         │
│ │  2,450  │  │  1,823  │  │   627   │  │  25.6%  │         │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│                                                               │
│ [Filters & Actions]                                           │
│ [Status: All ▼] [Search...] [Order: Position ▼]             │
│                                                               │
│ [Bulk Actions]                                                │
│ └─ [Activate Next 50 Users] [Export CSV]                     │
│                                                               │
│ [Table]                                                       │
│ ┌────┬───────────┬─────────┬────────┬──────────┬──────────┐│
│ │ #  │ Name      │ Email   │ Parrns │ Status   │ Actions  ││
│ ├────┼───────────┼─────────┼────────┼──────────┼──────────┤│
│ │  1 │ John D.   │ john@.. │   15   │ ACTIVE   │ [View]   ││
│ │  2 │ Sarah M.  │ sara@.. │   12   │ ACTIVE   │ [View]   ││
│ │  3 │ Mike T.   │ mike@.. │    8   │ WAITING  │ [Activate]│
│ │ ...│ ...       │ ...     │  ...   │ ...      │ ...      ││
│ └────┴───────────┴─────────┴────────┴──────────┴──────────┘│
│                                                               │
│ [Pagination: 1 2 3 ... 49 50 >]                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Page `/admin/ambassadors`

#### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ Admin - Ambassadors Management                       [Yannis]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [+ Create New Ambassador]                                     │
│                                                               │
│ [Ambassadors Grid]                                            │
│ ┌────────────────────┐  ┌────────────────────┐             │
│ │ 👤 John Doe        │  │ 👤 Sarah Lee       │             │
│ │ CEO @ StartupX     │  │ Investor @ VCFund  │             │
│ │                    │  │                    │             │
│ │ ✅ Active          │  │ ✅ Active          │             │
│ │ 🎯 47 invitations  │  │ 🎯 23 invitations  │             │
│ │                    │  │                    │             │
│ │ [Edit] [Deactivate]│  │ [Edit] [Deactivate]│             │
│ └────────────────────┘  └────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Composants UI Clés

### 1. WaitlistTable

```tsx
interface WaitlistUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  waitlistStatus: 'WAITING' | 'ACTIVE';
  position: number;
  referralCount: number;
  createdAt: string;
  activatedAt: string | null;
}

function WaitlistTable({ users }: { users: WaitlistUser[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Referrals</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <WaitlistUserRow key={user.id} user={user} />
        ))}
      </tbody>
    </table>
  );
}
```

---

### 2. BulkActivationModal

```tsx
function BulkActivationModal({ onConfirm }: { onConfirm: (count: number) => void }) {
  const [count, setCount] = useState(50);

  return (
    <Modal>
      <h2>Bulk Activation</h2>
      <p>Activate the next X users in the waitlist queue</p>
      
      <Input
        type="number"
        label="Number of users to activate"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        min={1}
        max={500}
      />
      
      <p className="text-muted">
        This will activate users based on their position (referralCount + createdAt)
      </p>
      
      <Button onClick={() => onConfirm(count)}>
        Activate {count} Users
      </Button>
    </Modal>
  );
}
```

---

### 3. CreateAmbassadorModal

```tsx
function CreateAmbassadorModal({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [profileSearch, setProfileSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  return (
    <Modal>
      <h2>Create Ambassador</h2>
      
      {/* Étape 1 : Chercher un profil */}
      {!selectedProfile && (
        <>
          <Input
            label="Search profile by email or name"
            value={profileSearch}
            onChange={(e) => setProfileSearch(e.target.value)}
          />
          <ProfileSearchResults
            query={profileSearch}
            onSelect={setSelectedProfile}
          />
        </>
      )}
      
      {/* Étape 2 : Compléter les infos ambassadeur */}
      {selectedProfile && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="selected-profile">
            Selected: {selectedProfile.firstName} {selectedProfile.lastName}
          </div>
          
          <Input name="name" label="Display Name" />
          <Input name="title" label="Title (e.g. CEO @ StartupX)" />
          <Textarea name="bio" label="Bio (optional)" />
          <Input name="interviewUrl" label="Interview URL (YouTube, etc.)" />
          <Input name="avatarUrl" label="Avatar URL (optional)" />
          
          <Button type="submit">Create Ambassador</Button>
        </form>
      )}
    </Modal>
  );
}
```

---

## 🔄 Bannière Ambassadeur & Parrainage (Frontend)

### Page `/signup` - Améliorations

#### Détection Référence (Ambassadeur ou User)

```tsx
// onefive-front/src/features/auth/Signup/index.tsx

useEffect(() => {
  const refCode = searchParams.get('ref');
  if (refCode) {
    // Stocker le code dans cookie (déjà fait ✅)
    setCookie('referredByCode', refCode, { ... });
    
    // Fetch infos du parrain pour afficher bannière
    fetchReferrerInfo(refCode);
  }
}, [searchParams]);

async function fetchReferrerInfo(code: string) {
  try {
    // Essayer de fetch comme ambassadeur
    const ambassador = await api.get(`admin/ambassador/by-code/${code}`);
    setReferrer({ type: 'AMBASSADOR', data: ambassador });
  } catch {
    // Sinon, fetch comme user normal
    try {
      const user = await api.get(`profile/by-referral-code/${code}`);
      setReferrer({ type: 'USER', data: user });
    } catch {
      // Code invalide
      setReferrer(null);
    }
  }
}
```

---

### Composant Bannière Universelle

```tsx
function ReferralBanner({ referrer }: { referrer: Referrer }) {
  if (referrer.type === 'AMBASSADOR') {
    return (
      <div className="ambassador-hero-banner">
        <div className="ambassador-badge">
          <Avatar src={referrer.data.avatarUrl} size="lg" />
          <div>
            <h3>{referrer.data.name}</h3>
            <p className="text-muted">{referrer.data.title}</p>
            <span className="badge-ambassador">👑 Ambassador</span>
          </div>
        </div>
        
        <div className="ambassador-message">
          <h2>🎉 Welcome! {referrer.data.name} is opening the doors of OneFive for you</h2>
          <p>Your immediate access is unlocked ✨</p>
        </div>
        
        {referrer.data.interviewUrl && (
          <a href={referrer.data.interviewUrl} target="_blank">
            Watch their interview →
          </a>
        )}
      </div>
    );
  }
  
  // User normal
  return (
    <div className="referral-banner">
      <div className="flex items-center gap-3">
        <Avatar src={referrer.data.avatarUrl} />
        <div>
          <p className="text-sm text-muted">You were referred by</p>
          <p className="font-semibold">
            {referrer.data.firstName} {referrer.data.lastName}
          </p>
        </div>
      </div>
      <div className="referral-perks">
        <span className="badge">🚀 Priority access</span>
      </div>
    </div>
  );
}
```

---

## 📝 Checklist d'Implémentation

### Phase 1 : Backend Admin (2 jours)

- [ ] **Migration Prisma** : Ajouter `role` enum dans Profile
- [ ] **Module Admin** : Créer module + controller + service + guard
- [ ] **AdminGuard** : Vérifier role ADMIN/SUPER_ADMIN
- [ ] **Handlers Waitlist** :
  - [ ] `get-waitlist-users.handler.ts`
  - [ ] `activate-user.handler.ts`
  - [ ] `bulk-activate-users.handler.ts`
- [ ] **Handlers Ambassadors** :
  - [ ] `get-ambassadors.handler.ts`
  - [ ] `create-ambassador.handler.ts`
  - [ ] `update-ambassador.handler.ts`
  - [ ] `delete-ambassador.handler.ts`
  - [ ] `get-ambassador-by-code.handler.ts`
- [ ] **Endpoints** : Tous les endpoints listés ci-dessus
- [ ] **Tests E2E** : Admin endpoints

---

### Phase 2 : Frontend Admin (1-2 jours)

- [ ] **AdminGuard Frontend** : Vérifier role avant d'accéder à /admin
- [ ] **Layout Admin** : Sidebar navigation
- [ ] **Page `/admin`** : Dashboard principal avec stats
- [ ] **Page `/admin/waitlist`** :
  - [ ] Composant `WaitlistTable`
  - [ ] Composant `WaitlistFilters`
  - [ ] Composant `BulkActivationModal`
  - [ ] Composant `ActivateUserModal`
- [ ] **Page `/admin/ambassadors`** :
  - [ ] Composant `AmbassadorList`
  - [ ] Composant `CreateAmbassadorModal`
  - [ ] Composant `EditAmbassadorModal`
- [ ] **Queries React** : Mutations pour activate, bulk-activate, create/update ambassadors

---

### Phase 3 : Bannière Signup (1 jour)

- [ ] **Endpoint Backend** : `GET /admin/ambassador/by-code/:code`
- [ ] **Endpoint Backend** : `GET /profile/by-referral-code/:code`
- [ ] **Hook Frontend** : `useFetchReferrer(code)` pour détecter ambassadeur/user
- [ ] **Composant** : `ReferralBanner` (2 variantes : ambassadeur vs user)
- [ ] **Intégration** : Afficher bannière sur `/signup` si `?ref=` présent

---

## 🚀 Ordre de Priorité

### 🔴 **P0 - Critique (Must-Have)**
1. Backend Admin endpoints (waitlist + ambassadors)
2. AdminGuard (backend + frontend)
3. Page `/admin/waitlist` avec Bulk Activation
4. Badge Early Adopter auto-attribution

### 🟠 **P1 - Important (Should-Have)**
5. Page `/admin/ambassadors` (création + gestion)
6. Bannière Ambassadeur sur `/signup`
7. Bannière User sur `/signup` (plus simple, moins élogieuse)

### 🟢 **P2 - Nice-to-Have**
8. Stats avancées dans dashboard admin
9. Export CSV des users waitlist
10. Logs d'actions admin (qui a activé qui, quand)

---

## ✅ Conclusion

**Architecture Finale** :
- ✅ **onefive-front** : Admin dashboard intégré (/admin)
- ✅ **onefive-back** : Nouveaux endpoints admin + AdminGuard
- ✅ **onefive-bo** : Reste pour la landing page (séparé)

**Estimation** : **4-5 jours** de dev pour compléter P0 + P1

**Prochaine Étape** : Commencer par la migration Prisma (role) + AdminGuard backend

---

**Dernière Mise à Jour** : 8 février 2026
