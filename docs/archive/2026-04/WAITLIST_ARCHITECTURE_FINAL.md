# 🏗️ Architecture Finale - Waitlist OneFive

> **Date** : 8 février 2026  
> **Status** : Validé après audit  
> **Changements clés** : Profile au centre, suppression des compteurs, validation phoneNumber

---

## 🎯 Décisions Validées

### 1. **TOUT sur Profile** ✅
- L'utilisateur fait **l'onboarding d'abord** → crée son Profile
- Puis accède à la page `/waitlist` avec son referralCode déjà généré
- Donc **tous les champs waitlist vont sur Profile** (pas sur User)

### 2. **Suppression des Compteurs**
- ❌ Supprimer `ReferralStats.totalSent`, `totalAccepted`, `totalPending`, `rank`
- ❌ Supprimer **tous les Int** dans ReferralStats (garder uniquement `currentTier`)
- ✅ Tout calculer dynamiquement avec `profile._count.referralsMade` et filtres Prisma

### 3. **Phone Vérifié**
- ✅ `User.phoneNumber !== null` = vérifié (pas besoin de champ `phoneVerified`)

### 4. **Leaderboard**
- ❌ Pas de `showInLeaderboard` opt-in
- ✅ Tout le monde apparaît dans le leaderboard (pas le choix)

### 5. **Admin Dashboard**
- ⏸️ Skip pour l'instant (on verra plus tard)

### 6. **Emails**
- ✅ Modifier `onefive-email` pour les templates (Founding Member, Account Activated)

---

## � Flow Utilisateur Complet

### Flux A : Utilisateur Normal (Waitlist)

```
1. POST /auth/signup (email, password)
   → User créé avec isEmailVerified = false
   
2. Redirection /auth/confirm/email
   → EmailGuard: bloque tant que isEmailVerified = false
   → User vérifie son email (clique lien)
   
3. Redirection /onboarding
   → OnboardingGuard: bloque tant que profile = null
   → User crée son profil (firstName, lastName, phoneNumber, etc.)
   → Profile.waitlistStatus = WAITING par défaut
   → Profile.referralCode généré automatiquement (cuid())
   
4. Redirection /waitlist
   → WaitlistGuard: bloque tant que profile.waitlistStatus = WAITING
   → Affiche position, lien de parrainage, progression badges
   → User peut uniquement accéder à /waitlist (toutes autres pages redirigent vers /waitlist)
   
5. Activation (manuelle admin OU auto 10+ parrainages)
   → profile.waitlistStatus = ACTIVE
   → Redirection /feed
   → Accès complet à l'app
```

### Flux B : Invitation Ambassadeur (Accès Direct)

```
1. User clique sur lien ambassadeur: /signup?ref=AMB_XYZ123
   
2. POST /auth/signup (email, password)
   → Cookie: referral_code = AMB_XYZ123 stocké
   
3. Redirection /auth/confirm/email (idem flux A)
   
4. Redirection /onboarding
   → Après création Profile, backend détecte cookie referral_code
   → Profile.referredBy = AMB_XYZ123
   → Profile.referrerType = AMBASSADOR
   → Backend active immédiatement: waitlistStatus = ACTIVE
   → ❌ Pas de badge (juste l'accès)
   
5. Redirection /feed (skip /waitlist)
   → Accès complet à l'app
```

### Flux C : Parrainage Utilisateur (Waitlist Accélérée)

```
1. User clique sur lien: /signup?ref=USER_ABC456
   
2-4. Identique au Flux A (waitlist normale)
   → Profile.referredBy = USER_ABC456
   → Profile.referrerType = USER
   
5. Quand onboarding terminé (email + phone vérifiés)
   → Backend incrémente le compteur du parrain (calcul dynamique)
   → Si parrain atteint 10 parrainages → auto-activation + badge Founding Member
```

---

## 🛡️ Guards (Middleware Frontend)

### 1. EmailGuard (Priorité 1)
```typescript
// Protection: Bloque si email pas vérifié
if (!user.isEmailVerified) {
  redirect('/auth/confirm/email');
}
```

### 2. OnboardingGuard (Priorité 2)
```typescript
// Protection: Bloque si profil pas créé
if (!user.profile) {
  redirect('/onboarding');
}
```

### 3. WaitlistGuard (Priorité 3)
```typescript
// Protection: Bloque si waitlist pas active
if (user.profile.waitlistStatus === 'WAITING') {
  // Exception: autoriser /waitlist
  if (pathname !== '/waitlist') {
    redirect('/waitlist');
  }
}
```

### Ordre d'exécution dans middleware.ts
```typescript
// 1. Check email verified
if (!isEmailVerified) return redirect('/auth/confirm/email');

// 2. Check profile exists
if (!hasProfile) return redirect('/onboarding');

// 3. Check waitlist status
if (waitlistStatus === 'WAITING' && pathname !== '/waitlist') {
  return redirect('/waitlist');
}

// 4. Accès autorisé
return NextResponse.next();
```

---

## �📐 Schéma Prisma Final

### user.prisma (Aucun changement)

```prisma
// ✅ User reste tel quel - pas de champs waitlist ici
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  password        String?
  phoneNumber     String?  @unique // Si non-null = vérifié
  isEmailVerified Boolean  @default(false)
  authType        AuthType
  linkedinId      String?  @unique
  googleId        String?  @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations existantes (inchangées)
  emailVerification EmailVerification?
  passwordReset     PasswordReset?
  profile           Profile?
  sessions          Session[]
  smsVerifications  SmsVerification[]
  streaks           Streak[]
  settings          UserSettings?
}
```

### profile.prisma (Extensions)

```prisma
model Profile {
  // ... champs existants ...
  
  // ✅ Waitlist (nouveau)
  waitlistStatus  WaitlistStatus @default(WAITING)
  activatedAt     DateTime? // Date d'accès effectif à l'app
  referralCode    String   @unique @default(cuid()) // Code unique pour partager
  referredBy      String?  // Code du parrain qui a invité ce profil
  referrerType    ReferrerType?
  
  // ✅ Badges (nouveau)
  badges          UserBadge[]
  
  // Relations existantes
  referralsMade     Referral[] @relation("ReferralsMade")
  referralStats     ReferralStats? // ⚠️ À modifier (voir ci-dessous)
  
  @@index([waitlistStatus])
  @@index([referralCode])
  @@index([referredBy])
}

enum WaitlistStatus {
  WAITING  // En attente d'activation
  ACTIVE   // Accès accordé
}

enum ReferrerType {
  AMBASSADOR // Parrainé par un ambassadeur
  USER       // Parrainé par un utilisateur normal
}
```

### referral.prisma (Modifications)

```prisma
// ✅ Referral : changer invitedUserId → invitedProfileId
model Referral {
  id                String         @id @default(uuid())
  referrerId        String         // profileId du parrain
  invitedEmail      String         // Email de la personne invitée
  invitedProfileId  String?        @unique // ✅ CHANGÉ : profileId au lieu de userId
  status            ReferralStatus @default(PENDING)
  code              String         @unique @default(uuid())
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  acceptedAt        DateTime?
  expiresAt         DateTime?

  referrer          Profile        @relation("ReferralsMade", fields: [referrerId], references: [id], onDelete: Cascade)
  invitedProfile    Profile?       @relation("ReferralReceived", fields: [invitedProfileId], references: [id])

  @@unique([referrerId, invitedEmail])
  @@index([referrerId])
  @@index([invitedEmail])
  @@index([status])
  @@index([code])
}

// ❌ SUPPRIMER complètement les Int, GARDER uniquement le tier
model ReferralStats {
  id              String   @id @default(uuid())
  profileId       String   @unique
  currentTier     String   @default("starter") // Starter → Diamond
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  profile         Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

enum ReferralStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}
```

### badge.prisma (Nouveau fichier)

```prisma
// Badges système (Early Adopter, Founding Member, Ambassador)
model Badge {
  id          String      @id @default(uuid())
  type        BadgeType   @unique
  name        String
  description String
  iconUrl     String?
  
  users       UserBadge[]
  
  createdAt   DateTime @default(now())
}

enum BadgeType {
  EARLY_ADOPTER      // 500 premiers activés
  FOUNDING_MEMBER    // 10+ parrainages + Premium à vie
  AMBASSADOR         // Ambassadeur officiel
}

// Table de jonction Profile <-> Badge
model UserBadge {
  id          String   @id @default(uuid())
  profileId   String   // ✅ Sur Profile (aspect social)
  badgeId     String
  assignedAt  DateTime @default(now())
  
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([profileId, badgeId])
  @@index([profileId])
}
```

### ambassador.prisma (Nouveau fichier)

```prisma
// Ambassadeurs officiels (fondateurs interviewés)
model Ambassador {
  id              String   @id @default(uuid())
  profileId       String   @unique
  profile         Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  name            String
  title           String?  // Ex: "CEO @ StartupXYZ"
  bio             String?
  interviewUrl    String?  // Lien YouTube/Vimeo
  avatarUrl       String?
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([isActive])
}
```

---

## 🔢 Calculs Dynamiques (Pas de Compteurs)

### 1. Position dans la Waitlist

```typescript
async getWaitlistPosition(profileId: string): Promise<number> {
  // Position basée sur le nombre de parrainages acceptés (DESC) puis createdAt (ASC)
  const result = await this.prisma.$queryRaw<[{ position: bigint }]>`
    WITH profile_referral_counts AS (
      SELECT 
        p.id,
        p."createdAt",
        COUNT(r.id) FILTER (WHERE r.status = 'ACCEPTED') as accepted_count
      FROM "Profile" p
      LEFT JOIN "Referral" r ON r."referrerId" = p.id
      WHERE p."waitlistStatus" = 'WAITING'
      GROUP BY p.id, p."createdAt"
    )
    SELECT COUNT(*) + 1 AS position
    FROM profile_referral_counts prc
    WHERE prc.accepted_count > (SELECT accepted_count FROM profile_referral_counts WHERE id = ${profileId})
       OR (prc.accepted_count = (SELECT accepted_count FROM profile_referral_counts WHERE id = ${profileId})
           AND prc."createdAt" < (SELECT "createdAt" FROM profile_referral_counts WHERE id = ${profileId}))
  `;
  
  return Number(result[0].position);
}
```

### 2. Stats de Parrainage (Dynamique)

```typescript
async getReferralStats(profileId: string) {
  const counts = await this.prisma.referral.groupBy({
    by: ['status'],
    where: { referrerId: profileId },
    _count: true,
  });

  const totalSent = counts.reduce((acc, c) => acc + c._count, 0);
  const totalAccepted = counts.find((c) => c.status === 'ACCEPTED')?._count || 0;
  const totalPending = counts.find((c) => c.status === 'PENDING')?._count || 0;

  const currentTier = this.calculateTier(totalAccepted);

  return {
    totalSent,
    totalAccepted,
    totalPending,
    currentTier,
  };
}
```

### 3. Leaderboard (Top 50 - Tout le monde)

```typescript
async getLeaderboard(limit: number = 50) {
  // Query SQL pour calculer le rang dynamiquement
  const leaderboard = await this.prisma.$queryRaw<any[]>`
    WITH referral_counts AS (
      SELECT 
        p.id as "profileId",
        p."firstName",
        p."lastName",
        p."avatarId",
        COUNT(r.id) FILTER (WHERE r.status = 'ACCEPTED') as accepted_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(r.id) FILTER (WHERE r.status = 'ACCEPTED') DESC, p."createdAt" ASC) as rank
      FROM "Profile" p
      LEFT JOIN "Referral" r ON r."referrerId" = p.id
      GROUP BY p.id, p."firstName", p."lastName", p."avatarId", p."createdAt"
      HAVING COUNT(r.id) FILTER (WHERE r.status = 'ACCEPTED') > 0
    )
    SELECT * FROM referral_counts
    ORDER BY rank
    LIMIT ${limit}
  `;

  return leaderboard.map(entry => ({
    rank: Number(entry.rank),
    profileId: entry.profileId,
    name: `${entry.firstName} ${entry.lastName.charAt(0)}.`,
    referralCount: Number(entry.accepted_count),
    avatarId: entry.avatarId,
  }));
}
```

### 4. Auto-Activation Founding Member (10+ parrainages)

```typescript
// ✅ Appelé après chaque onboarding complété d'un filleul
async checkAndActivateFoundingMember(profileId: string) {
  const profile = await this.prisma.profile.findUnique({
    where: { id: profileId },
    include: { 
      user: true,
      _count: {
        select: {
          referralsMade: {
            where: { status: 'ACCEPTED' }
          }
        }
      }
    },
  });

  if (!profile || profile.waitlistStatus === 'ACTIVE') return;

  const acceptedCount = profile._count.referralsMade;

  // Si >= 10 → Activer + Badge Founding Member
  if (acceptedCount >= 10) {
    // 1. Activer l'accès
    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        waitlistStatus: 'ACTIVE',
        activatedAt: new Date(),
      },
    });

    // 2. Assigner le badge Founding Member
    const foundingBadge = await this.prisma.badge.findUnique({
      where: { type: 'FOUNDING_MEMBER' },
    });

    await this.prisma.userBadge.create({
      data: {
        profileId,
        badgeId: foundingBadge.id,
      },
    });

    // 3. Email de félicitations
    await this.emailService.sendFoundingMemberUnlocked({
      email: profile.user.email,
      name: profile.firstName,
    });
  }
}
```

### 5. Activation Ambassadeur (Après Onboarding)

```typescript
// ✅ Appelé juste après la création du Profile
async activateIfAmbassadorReferred(profileId: string) {
  const profile = await this.prisma.profile.findUnique({
    where: { id: profileId },
  });

  // Si référé par un ambassadeur → activation immédiate
  if (profile.referrerType === 'AMBASSADOR') {
    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        waitlistStatus: 'ACTIVE',
        activatedAt: new Date(),
      },
    });
    
    // ❌ Pas de badge (juste l'accès)
  }
}
```

```typescript
async activateProfile(profileId: string) {
  // 1. Activer le profil
  await this.prisma.profile.update({
    where: { id: profileId },
    data: {
      waitlistStatus: 'ACTIVE',
      activatedAt: new Date(),
    },
  });

  // 2. Vérifier si éligible au badge Early Adopter
  const activeCount = await this.prisma.profile.count({
    where: { waitlistStatus: 'ACTIVE' },
  });

  if (activeCount <= 500) {
    const earlyAdopterBadge = await this.prisma.badge.findUnique({
      where: { type: 'EARLY_ADOPTER' },
    });

    await this.prisma.userBadge.create({
      data: {
        profileId,
        badgeId: earlyAdopterBadge.id,
      },
    });
  }
}
```

---

## 🔄 Migration des Compteurs Existants

### Étapes

1. **Backup** : Sauvegarder `ReferralStats` avant suppression
2. **Migration** : Supprimer les colonnes `totalSent`, `totalAccepted`, `totalPending`, `rank`
3. **Code** : Remplacer tous les usages par des calculs dynamiques
4. **Tests** : Vérifier que les performances restent OK

### Fichiers à Modifier

```bash
# Backend - Prisma
onefive-back/prisma/schema/profile.prisma           # Ajouter champs waitlist
onefive-back/prisma/schema/referral.prisma          # Supprimer compteurs + changer invitedUserId
onefive-back/prisma/schema/badge.prisma             # Créer (nouveau)

# Backend - Services
onefive-back/src/referral/referral.service.ts       # Remplacer updateReferralStats()
onefive-back/src/referral/handlers/get-stats.handler.ts
onefive-back/src/referral/handlers/get-leaderboard.handler.ts

# Backend - Nouveau module
onefive-back/src/waitlist/                          # Créer module complet

# Frontend
onefive-front/src/hooks/useReferral.ts              # Types à jour
onefive-front/src/app/(protected)/waitlist/         # Nouvelle page
onefive-front/src/app/(auth)/signup/                # Détection ?ref=

# Emails
onefive-email/transactional/                        # Templates waitlist
```

---

## 📋 Plan d'Action (5 jours)

### Jour 1 : Backend - Migrations
- [ ] Migration Prisma (User, Profile, Badge, UserBadge, Ambassador)
- [ ] Suppression des compteurs dans ReferralStats
- [ ] Seed badges (EARLY_ADOPTER, FOUNDING_MEMBER, AMBASSADOR)
- [ ] Tests migration

### Jour 2 : Backend - Refactoring Référal
- [ ] Refactor `referral.service.ts` (calculs dynamiques)
- [ ] Refactor handlers (get-stats, get-leaderboard)
- [ ] Tests unitaires

### Jour 3 : Backend - Module Waitlist
- [ ] Module `/waitlist` (controller, service)
- [ ] Intégration signup (détection referralCode)
- [ ] Hook validation parrainage (email + phone vérifié)
- [ ] Auto-activation Founding Member
- [ ] Endpoints API

### Jour 4 : Frontend - Pages Waitlist
- [ ] Extension `/signup` (détection `?ref=`)
- [ ] Page `/waitlist/dashboard`
- [ ] Composants (badges, progression, leaderboard)
- [ ] Messages de partage social

### Jour 5 : Emails & Tests
- [ ] Templates emails dans `onefive-email`
- [ ] Tests end-to-end complets
- [ ] Documentation finale

---

## ✅ Checklist de Validation

- [ ] Aucun compteur stocké en DB (tout dynamique avec `_count`)
- [ ] `phoneNumber !== null` = vérifié (pas de champ supplémentaire)
- [ ] **TOUT sur Profile** : waitlistStatus, badges, referralCode
- [ ] User inchangé (aucune modification nécessaire)
- [ ] Pas d'opt-in leaderboard (tout le monde apparaît)
- [ ] `Referral.invitedProfileId` au lieu de `invitedUserId`
- [ ] Queries performantes (index appropriés)
- [ ] Tests de charge (1000+ profiles en waitlist)
- [ ] Emails configurés dans onefive-email

---

**Status** : ✅ Architecture validée - Prêt pour implémentation
