# 🎯 Stratégie Waitlist & Clubhouse Effect - OneFive

> **Date** : 8 février 2026  
> **Status** : En planification  
> **Objectif** : Transformer le lancement public en système de croissance virale via waitlist gamifiée

---

## 📖 Vue d'Ensemble

OneFive passe d'un modèle "portes ouvertes" à un modèle "Club Privé" pour créer de la traction et de la valeur perçue par la rareté.

### Les 5 Piliers de la Stratégie

1. **Positionnement "Bêta Privée"** : L'accès est sélectif, on n'entre que par invitation ou en montant dans la liste d'attente
2. **File d'Attente Gamifiée** : Chaque inscrit voit son rang et peut parrainer pour avancer
3. **Ambassadeurs** : Les fondateurs interviewés donnent l'accès immédiat (bypass waitlist)
4. **Badge "Founding Member"** : Top parrains reçoivent un badge + avantages Premium à vie
5. **Ouverture Progressive** : Activation manuelle + auto pour les Founding Members (contrôle qualité)

---

## 🎮 Système de Badges (3 Types)

| Badge | Critère | Avantage |
|-------|---------|----------|
| **🌟 Early Adopter** | Fait partie des 500 premiers activés | Statut social, reconnaissance communauté |
| **🏆 Founding Member** | 10+ parrainages validés | Badge permanent + **Premium à vie** + accès immédiat |
| **👑 Ambassadeur** | Attribué manuellement (fondateurs interviewés) | Badge prestigieux + pouvoir de donner accès direct |

---

## 🔄 Flux Utilisateurs

### Flux A : Invitation Ambassadeur (Accès Immédiat)

```
1. Ambassadeur partage : onefive.com/signup?ref=AMB_XYZ123
2. User clique → Page /signup avec bannière ambassadeur
   - Hero Banner : "Bienvenue ! [Nom] t'ouvre les portes de OneFive"
   - Photo + titre de l'ambassadeur
   - Lien vers son interview (optionnel)
3. User crée son compte (email, password, profil)
4. Backend :
   - Détecte ref=AMB_XYZ123
   - waitlistStatus = 'ACTIVE' (accès immédiat)
   - referrerType = 'AMBASSADOR'
   - activatedAt = now()
5. Toast : "Bienvenue ! Tu as été invité par [Nom]. Ton accès est actif."
6. Redirection → /feed (accès complet à l'app)
```

### Flux B : Utilisateur Normal (Waitlist)

```
1. User va sur onefive.com/signup (sans ref)
2. User crée son compte
3. Backend :
   - waitlistStatus = 'WAITING'
   - Position calculée dynamiquement (basée sur referralCount + createdAt)
4. Redirection → /waitlist/dashboard
5. Affiche :
   - "Tu es #2,450 dans la file"
   - Progression vers badge Founding Member (0/10 parrainages)
   - Lien de parrainage : onefive.com/signup?ref=USER_ABC456
   - Boutons de partage (LinkedIn, WhatsApp, Twitter)
```

### Flux C : Parrainage Utilisateur (Waitlist Accélérée)

```
1. User B clique sur lien de User A : onefive.com/signup?ref=USER_ABC456
2. User B crée son compte + vérifie email + vérifie phone
3. Backend :
   - User B → waitlistStatus = 'WAITING'
   - User A → referralCount++ (position recalculée automatiquement)
   - Si User A atteint 10 parrainages :
     ✅ waitlistStatus = 'ACTIVE' (accès immédiat)
     ✅ Badge "Founding Member" assigné
     ✅ Email "Félicitations, tu as débloqué l'accès !"
4. User B voit : "Tu es #2,500. Tu as été parrainé par [User A]"
```

---

## 🏗️ Architecture Technique

### Schéma Prisma Final

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  phoneNumber     String?  @unique
  emailVerified   Boolean  @default(false)
  phoneVerified   Boolean  @default(false)
  
  // Système de parrainage
  referralCode    String   @unique @default(cuid())
  referredBy      String?  // Code du parrain
  referrerType    ReferrerType?
  referredAt      DateTime? // Date du clic sur le lien
  referralCount   Int      @default(0) // Nombre de parrainages validés
  
  // Waitlist
  waitlistStatus  WaitlistStatus @default(WAITING)
  activatedAt     DateTime? // Date d'accès effectif à l'app
  
  // Leaderboard
  showInLeaderboard Boolean @default(false) // Opt-in pour apparaître dans le Top 50
  
  // ⚠️ PAS de waitlistPosition en dur (calculé dynamiquement)
  
  // Badges (many-to-many)
  badges          UserBadge[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  profile         Profile?
  ambassador      Ambassador?
  
  @@index([waitlistStatus])
  @@index([referralCount, createdAt]) // Pour calcul position
  @@index([showInLeaderboard, referralCount]) // Pour leaderboard
}

enum ReferrerType {
  AMBASSADOR  // Parrainé par un ambassadeur
  USER        // Parrainé par un utilisateur normal
}

enum WaitlistStatus {
  WAITING     // En attente
  ACTIVE      // Accès accordé
}

// Table de jonction pour les badges
model UserBadge {
  id          String   @id @default(uuid())
  userId      String
  badgeId     String
  assignedAt  DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([userId, badgeId])
  @@index([userId])
}

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

model Ambassador {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name            String
  title           String?  // Ex: "CEO @ StartupXYZ"
  bio             String?
  interviewUrl    String?  // Lien YouTube/Vimeo
  avatarUrl       String?
  
  invitationCount Int      @default(0) // Nombre d'invitations converties
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([isActive])
}
```

### Calcul de Position (Dynamique)

⚠️ **CRITIQUE** : Ne jamais stocker `waitlistPosition` en dur dans la DB (problème de performance).

**Approche** : Position calculée à la volée via SQL query.

```typescript
// Service : Calculer la position dynamiquement
async getWaitlistPosition(userId: string): Promise<number> {
  // Position basée sur :
  // 1. referralCount DESC (plus de parrainages = meilleure position)
  // 2. createdAt ASC (ancienneté si égalité)
  
  const result = await this.prisma.$queryRaw<[{ position: bigint }]>`
    SELECT COUNT(*) + 1 AS position
    FROM "User"
    WHERE "waitlistStatus" = 'WAITING'
    AND (
      "referralCount" > (SELECT "referralCount" FROM "User" WHERE id = ${userId})
      OR (
        "referralCount" = (SELECT "referralCount" FROM "User" WHERE id = ${userId})
        AND "createdAt" < (SELECT "createdAt" FROM "User" WHERE id = ${userId})
      )
    )
  `;
  
  return Number(result[0].position);
}
```

### Trigger Founding Member (Auto-Activation)

```typescript
// Handler : Validation d'un parrainage
async handleReferralValidation(referrerId: string) {
  // 1. Incrémenter le compteur
  const user = await prisma.user.update({
    where: { id: referrerId },
    data: { referralCount: { increment: 1 } }
  });
  
  // 2. Si >= 10 parrainages → Activer + Badge
  if (user.referralCount >= 10) {
    // Activer l'accès immédiat
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        waitlistStatus: 'ACTIVE',
        activatedAt: new Date()
      }
    });
    
    // Assigner le badge Founding Member
    const foundingBadge = await prisma.badge.findUnique({
      where: { type: 'FOUNDING_MEMBER' }
    });
    
    await prisma.userBadge.create({
      data: {
        userId: referrerId,
        badgeId: foundingBadge.id
      }
    });
    
    // Email de félicitations
    await emailService.sendFoundingMemberUnlocked({
      email: user.email,
      name: user.firstName
    });
  }
}
```

### Anti-Spam : Vérification Email + Phone (Onboarding Complet)

**Règle** : Le `referralCount` ne s'incrémente **QUE** si le filleul a terminé l'onboarding complet (email + phone vérifiés).

```typescript
// Handler : Fin de l'onboarding
async completeOnboarding(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      phoneVerified: true,
      referredBy: true
    }
  });
  
  // Vérifier que email + phone sont vérifiés
  if (user.emailVerified && user.phoneVerified && user.referredBy) {
    // Récompenser le parrain
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy }
    });
    
    if (referrer) {
      await this.handleReferralValidation(referrer.id);
    }
  }
}
```

---

## 🎨 UI/UX Détaillé

### Page `/signup`

#### Sans Code de Parrainage

```tsx
<form>
  <Input name="email" placeholder="Email" />
  <Input name="password" placeholder="Mot de passe" type="password" />
  
  <Button onClick={() => setShowReferralInput(!showReferralInput)}>
    J'ai un code de parrainage
  </Button>
  
  {showReferralInput && (
    <Input 
      name="referralCode" 
      placeholder="Code de parrainage (optionnel)" 
    />
  )}
  
  <Button type="submit">Créer mon compte</Button>
</form>
```

#### Avec Code Ambassadeur (URL: ?ref=AMB_XYZ123)

```tsx
{/* Hero Banner en haut de page */}
<div className="ambassador-hero">
  <div className="ambassador-badge">
    <Avatar src={ambassador.avatarUrl} size="lg" />
    <div>
      <h3>{ambassador.name}</h3>
      <p className="text-muted">{ambassador.title}</p>
    </div>
  </div>
  
  <div className="ambassador-message">
    <h2>Bienvenue ! {ambassador.name} t'ouvre les portes de OneFive</h2>
    <p>Ton accès immédiat est débloqué ✨</p>
  </div>
  
  {ambassador.interviewUrl && (
    <a href={ambassador.interviewUrl} target="_blank">
      Voir son interview →
    </a>
  )}
</div>

{/* Badge appliqué (lecture seule) */}
<div className="badge-applied">
  ✨ Code de parrainage appliqué : {referralCode}
</div>

{/* Formulaire standard */}
<form>...</form>
```

### Page `/waitlist/dashboard`

```tsx
function WaitlistDashboard({ userId }) {
  const { position, referralCount, referralCode, badges } = useWaitlistStatus(userId);
  
  const progressToFoundingMember = (referralCount / 10) * 100;
  const shareLink = `${BASE_URL}/signup?ref=${referralCode}`;

  return (
    <div className="waitlist-dashboard">
      {/* Position actuelle */}
      <Card className="hero-card">
        <h1>Tu es #{position} dans la file d'attente</h1>
        <p>Partage ton lien pour avancer et débloquer des badges !</p>
      </Card>
      
      {/* Progression vers Founding Member */}
      <Card className="progress-card">
        <h2>🏆 Badge "Founding Member"</h2>
        <ProgressBar value={progressToFoundingMember} />
        <p>{referralCount}/10 parrainages</p>
        <p className="text-muted">
          10 parrainages = Badge + Accès immédiat + Premium à vie
        </p>
      </Card>
      
      {/* Lien de parrainage */}
      <Card className="share-card">
        <h3>Ton lien de parrainage</h3>
        <Input value={shareLink} readOnly />
        <Button onClick={() => copyToClipboard(shareLink)}>
          Copier le lien
        </Button>
        
        {/* Boutons de partage social */}
        <div className="social-buttons">
          <Button 
            variant="linkedin" 
            onClick={() => shareToLinkedIn(shareLink)}
          >
            LinkedIn
          </Button>
          <Button 
            variant="whatsapp" 
            onClick={() => shareToWhatsApp(shareLink)}
          >
            WhatsApp
          </Button>
          <Button 
            variant="twitter" 
            onClick={() => shareToTwitter(shareLink)}
          >
            Twitter
          </Button>
        </div>
      </Card>
      
      {/* Badges débloqués */}
      {badges.length > 0 && (
        <Card className="badges-card">
          <h3>Tes badges</h3>
          <div className="badges-grid">
            {badges.map(badge => (
              <BadgeCard 
                key={badge.id} 
                badge={badge}
                assignedAt={badge.assignedAt}
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* Leaderboard (Top 50 parrains) */}
      <Card className="leaderboard-card">
        <h3>🏆 Top 50 Parrains</h3>
        <Toggle 
          checked={showInLeaderboard}
          onChange={() => updateLeaderboardOptIn(!showInLeaderboard)}
          label="Apparaître dans le classement"
        />
        <LeaderboardList />
      </Card>
    </div>
  );
}
```

### Messages de Partage (Pré-Remplis)

#### WhatsApp / SMS
```
OneFive est en bêta privée et c'est incroyable pour connecter avec d'autres fondateurs.

J'ai un accès prioritaire pour toi : https://onefive.com/signup?ref=ABC123
```

#### LinkedIn
```
Je viens de rejoindre OneFive, le réseau privé pour entrepreneurs et fondateurs.

Si tu cherches à grandir ton réseau startup, voici un accès prioritaire : https://onefive.com/signup?ref=ABC123
```

#### Twitter/X
```
OneFive : le réseau social pour fondateurs, en bêta privée.

Accès prioritaire ici : https://onefive.com/signup?ref=ABC123
```

---

## ✅ Décisions Validées

| Question | Décision | Justification |
|----------|----------|---------------|
| **Activation waitlist** | Hybride : Auto pour Founding Members, manuel pour autres | Contrôle qualité + récompense automatique |
| **Founding Member** | Badge + accès immédiat à 10 parrainages | Récompense instantanée = viralité |
| **Early Adopter** | ✅ AUTO - Badge assigné si count(ACTIVE) < 500 | Course à l'activation, plus gratifiant |
| **Leaderboard** | ✅ Top 50 avec Prénom + Initiale (opt-in) | Émulation saine, rend le "Club" réel |
| **Validation parrainage** | Email + Phone vérifié (onboarding complet) | Anti-spam naturel via processus onboarding |
| **Bulk Activation** | ✅ Must-Have dans admin dashboard | Activer 50 users d'un coup pour les vagues |
| **Transition publique** | Activer tout le monde, garder les badges | Badges = médailles de vétéran |
| **Feed d'activité** | ❌ Retiré | Trop de pression, UX plus clean |
| **Message partage** | Version FOMO (Bêta privée) | Joue sur la rareté |
| **Bannière ambassadeur** | Hero Banner + Toast | Met en valeur les ambassadeurs |
| **Tracking** | Extended (referredAt, activatedAt) | Analytics solides |
| **Emails waitlist** | Gestion manuelle | Flexibilité totale |

---

## 🎖️ Détails d'Implémentation Clés

### Badge Early Adopter (Auto-Attribution)

**Logique** : Attribution automatique lors de l'activation d'un compte si le nombre total d'actifs < 500.

```typescript
// Handler : Activation d'un compte (manuel ou auto Founding Member)
async activateUser(userId: string) {
  // 1. Activer le compte
  await prisma.user.update({
    where: { id: userId },
    data: {
      waitlistStatus: 'ACTIVE',
      activatedAt: new Date()
    }
  });
  
  // 2. Vérifier si éligible au badge Early Adopter
  const activeCount = await prisma.user.count({
    where: { waitlistStatus: 'ACTIVE' }
  });
  
  if (activeCount <= 500) {
    const earlyAdopterBadge = await prisma.badge.findUnique({
      where: { type: 'EARLY_ADOPTER' }
    });
    
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: earlyAdopterBadge.id
      }
    });
    
    // Email optionnel : "Tu fais partie des 500 premiers !"
  }
}
```

### Leaderboard Public (Top 50 avec Opt-In)

**Affichage** : Top 50 parrains avec Prénom + Initiale (ex: "Yannis C. - 23 parrainages")

**Schema Prisma - Ajouter un champ opt-in** :

```prisma
model User {
  // ... autres champs
  showInLeaderboard Boolean @default(false) // Opt-in pour apparaître
}
```

**Query Leaderboard** :

```typescript
async getLeaderboard(limit: number = 50) {
  const topReferrers = await prisma.user.findMany({
    where: {
      showInLeaderboard: true,
      referralCount: { gt: 0 }
    },
    orderBy: [
      { referralCount: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit,
    select: {
      firstName: true,
      lastName: true,
      referralCount: true,
      badges: {
        include: {
          badge: {
            select: { type: true }
          }
        }
      }
    }
  });
  
  // Formater : "Yannis C."
  return topReferrers.map((user, index) => ({
    rank: index + 1,
    name: `${user.firstName} ${user.lastName.charAt(0)}.`,
    referralCount: user.referralCount,
    badges: user.badges.map(b => b.badge.type)
  }));
}
```

### Validation Parrainage (Onboarding Complet)

**Règle** : Le parrainage est validé quand l'onboarding est terminé (email vérifié + phone vérifié).

```typescript
// Handler : Fin de l'onboarding
async completeOnboarding(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      phoneVerified: true,
      referredBy: true
    }
  });
  
  // Vérifier que email + phone sont vérifiés
  if (user.emailVerified && user.phoneVerified && user.referredBy) {
    // Récompenser le parrain
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy }
    });
    
    if (referrer) {
      await this.handleReferralValidation(referrer.id);
    }
  }
}
```

### Bulk Activation (Admin Dashboard)

**Fonctionnalité** : Bouton "Activer les X prochains" dans l'admin dashboard.

```typescript
// Endpoint : POST /admin/waitlist/bulk-activate
async bulkActivate(count: number = 50) {
  // 1. Récupérer les X premiers de la file (position calculée)
  const usersToActivate = await prisma.$queryRaw`
    SELECT id
    FROM "User"
    WHERE "waitlistStatus" = 'WAITING'
    ORDER BY "referralCount" DESC, "createdAt" ASC
    LIMIT ${count}
  `;
  
  // 2. Activer tous ces users
  const userIds = usersToActivate.map(u => u.id);
  
  for (const userId of userIds) {
    await this.activateUser(userId); // Utilise la même logique (avec Early Adopter)
    await emailService.sendAccountActivated(userId);
  }
  
  return {
    success: true,
    activated: userIds.length
  };
}
```

### Transition vers Lancement Public

**Jour J** : Quand la bêta privée se termine et que l'app ouvre au public.

```typescript
// Script one-time : Activer tous les users WAITING
async openToPublic() {
  // 1. Activer tous les users en attente
  const result = await prisma.user.updateMany({
    where: { waitlistStatus: 'WAITING' },
    data: {
      waitlistStatus: 'ACTIVE',
      activatedAt: new Date()
    }
  });
  
  // 2. Envoyer un email collectif
  const allUsers = await prisma.user.findMany({
    where: { waitlistStatus: 'ACTIVE' },
    select: { email: true, firstName: true }
  });
  
  for (const user of allUsers) {
    await emailService.sendPublicLaunchAnnouncement(user);
  }
  
  console.log(`✅ ${result.count} users activés. OneFive est maintenant public !`);
  
  // 3. Les badges restent intacts (médailles de vétéran)
}
```

---

## 📋 Plan d'Action (Estimation 7 jours)

### Phase 1 : Backend Core (2-3 jours)

- [ ] Migration Prisma (User, Badge, UserBadge, Ambassador)
- [ ] Seed badges (EARLY_ADOPTER, FOUNDING_MEMBER, AMBASSADOR)
- [ ] Module `waitlist` (controller, service, module)
- [ ] Service : Calcul position dynamique
- [ ] Handler : Signup avec détection code ambassadeur
- [ ] Handler : Validation parrainage (email + phone vérifié)
- [ ] Trigger : Auto-activation Founding Member (>= 10 parrainages)
- [ ] Endpoints API :
  - `POST /auth/signup` (avec referralCode optionnel)
  - `GET /waitlist/status` (position, badges, stats)
  - `GET /waitlist/referral-link` (générer lien personnel)
  - `GET /waitlist/leaderboard` (Top 50 parrains avec opt-in)
  - `PUT /waitlist/leaderboard-opt-in` (toggle showInLeaderboard)

### Phase 2 : Frontend Waitlist (2-3 jours)

- [ ] Page `/signup` avec détection query param `?ref=`
- [ ] Composant `AmbassadorHeroBanner` (avec fetch data ambassadeur)
- [ ] Composant `ReferralCodeInput` (optionnel si pas de ref)
- [ ] Page `/waitlist/dashboard`
- [ ] Composant `WaitlistPosition` (affichage position)
- [ ] Composant `FoundingMemberProgress` (barre 0/10)
- [ ] Composant `ReferralShareCard` (lien + boutons sociaux)
- [ ] Composant `BadgesList` (badges débloqués)
- [ ] Composant `Leaderboard` (Top 50 avec toggle opt-in)
- [ ] Toast notification (après signup ambassadeur)

### Phase 3 : Admin Dashboard (1-2 jours)

- [ ] Page `/admin/waitlist`
  - [ ] Liste paginée users WAITING (triés par position)
  - [ ] Colonne : Position, Nom, Email, Parrainages, Date inscription
  - [ ] Action : Activer compte (bouton individuel)
  - [ ] **Action : Bulk Activation** (activer les X prochains - Must-Have)
  - [ ] Filtre : Par statut (WAITING / ACTIVE)
  - [ ] Recherche : Par email / nom
  - [ ] Stats globales : Total inscrits, En attente, Activés, Taux de parrainage
- [ ] Page `/admin/ambassadors`
  - [ ] Liste ambassadeurs (nom, email, invitations converties)
  - [ ] Formulaire : Créer ambassadeur
    - Input : userId (chercher par email)
    - Input : name, title, bio, interviewUrl, avatarUrl
  - [ ] Toggle : isActive (activer/désactiver)
  - [ ] Stats : Top 5 ambassadeurs les plus performants

### Phase 4 : Emails & Polish (1 jour)

- [ ] Email : "Founding Member Unlocked"
  - Objet : "🏆 Tu as débloqué le badge Founding Member !"
  - Contenu : Félicitations + Badge visible + Accès immédiat + Premium à vie
- [ ] Email : "Compte Activé" (sortie de waitlist manuelle)
  - Objet : "🎉 Ton accès OneFive est prêt !"
  - Contenu : Bienvenue + CTA créer profil
- [ ] Composant `BadgeCard` (design final)
  - Icône badge
  - Nom + description
  - Date d'attribution
- [ ] Affichage badges sur profil public (petit indicateur)

---

## 🚀 Métriques à Tracker (Analytics)

### Waitlist Metrics
- Nombre d'inscrits total (WAITING + ACTIVE)
- Nombre en waitlist (WAITING)
- Nombre activés (ACTIVE)
- Taux de parrainage (% qui ont >= 1 parrainage)
- Coefficient viral (moyenne parrainages par user)
- Taux de conversion waitlist → actif

### Ambassador Metrics
- Nombre d'ambassadeurs actifs
- Invitations converties par ambassadeur (moyenne)
- Top 5 ambassadeurs (plus performants)

### Badge Metrics
- Nombre de Founding Members
- Nombre d'Early Adopters
- Temps moyen pour débloquer Founding Member (jours)

### Engagement Metrics
- % Founding Members actifs à J+30
- Taux de rétention par type d'invitation (AMB vs USER)

---

## 📝 Notes Importantes

### Stockage du Code de Parrainage (Cookie)

Quand l'user arrive sur `/signup?ref=ABC123`, stocker le code en cookie **avant** la création du compte :

```typescript
// Dans /signup, dès l'arrivée
if (searchParams.ref) {
  cookies().set('referral_code', searchParams.ref, {
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
}
```

### Gestion des Ambassadeurs Inactifs

Si un ambassadeur partage son lien à 500 personnes, risque d'afflux massif.

**Solutions** :
- Limite par ambassadeur (ex: 100 invitations max)
- Monitoring manuel (alertes si > 50 invitations/jour)
- Flag `isActive` pour désactiver temporairement

### Transparence sur la Waitlist

Les gens vont demander "c'est quand mon tour ?". Message recommandé :

```
"Nous activons régulièrement de nouveaux comptes. 
Plus tu parraînes, plus tu es prioritaire. 
Les Founding Members (10+ parrainages) ont l'accès garanti."
```

---

## 🔗 Ressources

- **Prisma Schema** : `onefive-back/prisma/schema/waitlist.prisma` (à créer)
- **Module Backend** : `onefive-back/src/waitlist/` (à créer)
- **Pages Frontend** : `onefive-front/src/app/(auth)/signup/`, `onefive-front/src/app/(protected)/waitlist/`
- **Documentation Architecture** : `onefive-back/.cursorrules`

---

## ✍️ Changelog

| Date | Changement | Auteur |
|------|------------|--------|
| 8 fév 2026 | Création du document de stratégie | Yannis + Claude |
| 8 fév 2026 | Validation décisions clés | Yannis |
| 8 fév 2026 | Ajout schéma Prisma final | Claude |
| 8 fév 2026 | Ajout plan d'action détaillé | Claude |
| 8 fév 2026 | Validation finale toutes questions | Yannis |
| 8 fév 2026 | Ajout implémentation Early Adopter, Leaderboard, Bulk Activation | Claude |

---

**Status** : ✅ Toutes les décisions validées - Prêt pour implémentation
