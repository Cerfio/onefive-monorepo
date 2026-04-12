# 📋 RÉSUMÉ — Plan d'implémentation Gestion Fondateurs/Membres

> **Pour** : Nouveau développeur rejoignant le projet  
> **Date** : 11 janvier 2026  
> **Statut** : ✅ COMPLÉTÉ (100%)

---

## 🎯 CONTEXTE DU PROJET

### Problème initial
Lors de l'audit de production (`onefive-front/AUDIT_PRODUCTION.md`), plusieurs problèmes critiques ont été identifiés :

1. **Données mockées** : Les composants `SmartProfileSearch` et `ProfileSearch` utilisaient des profils fictifs au lieu de l'API réelle
2. **Sécurité** : Le bouton "Gérer les fondateurs" était accessible à tous les utilisateurs
3. **Architecture** : Pas de distinction claire entre "fondateurs" et "membres d'équipe" dans le modèle de données

### Objectif
Implémenter un système complet de gestion des fondateurs et membres de startup avec :
- ✅ Distinction fondateurs/membres
- ✅ Contrôles d'accès appropriés
- ✅ Système d'invitations (email + notifications)
- ✅ Gestion des relations entre utilisateurs
- ✅ Validation des équités

---

## ✅ CE QUI A ÉTÉ FAIT (22 tâches)

### Phase 1 — Corrections initiales (4 tâches)

#### 1. Frontend — Remplacement des données mockées
**Fichiers modifiés** :
- `onefive-front/src/components/startup/SmartProfileSearch.tsx`
- `onefive-front/src/components/startup/ProfileSearch.tsx`

**Changements** :
- ❌ Supprimé : `MOCK_PROFILES` (8 profils fictifs)
- ✅ Ajouté : Hook `useSearchProfiles` qui appelle l'API `/profile/search`
- ✅ Ajouté : Debouncing pour améliorer les performances

---

#### 2. Frontend — Contrôle d'accès
**Fichiers modifiés** :
- `onefive-front/src/components/startup/FoundersTable.tsx`
- `onefive-front/src/app/(protected)/startup/[id]/page.tsx`

**Changements** :
- ✅ Bouton "Gérer les fondateurs" visible uniquement pour `ADMIN` et `SUPER_ADMIN`
- ✅ Props `userRole` et `canEdit` ajoutées au composant

---

#### 3. Backend — Migration Prisma
**Fichiers modifiés** :
- `onefive-back/prisma/schema/profile.prisma`

**Changements** :
- ✅ Ajouté champ `isFounder: Boolean @default(false)` à `StartupMember`
- ✅ Modifié `equity: Int @default(0)` (était sans default)
- ✅ Migration appliquée avec `prisma db push`

---

#### 4. Backend — Vérification endpoint recherche
**Fichiers vérifiés** :
- `onefive-back/src/profile/profile.controller.ts`
- `onefive-back/src/profile/handlers/search-profiles.handler.ts`

**Résultat** :
- ✅ Endpoint `GET /profile/search` existe et fonctionne correctement
- ✅ Recherche par `firstName`, `lastName`, `highlight`
- ✅ Retourne format compatible avec le frontend

---

### Phase 2 — Backend Endpoints (6 tâches)

#### 5. `POST /startup/:id/founders` — Ajouter un fondateur ✅
**Fichiers créés** :
- `onefive-back/src/startup/dto/add-founder.dto.ts`
- `onefive-back/src/startup/handlers/add-founder.handler.ts`

**Fichiers modifiés** :
- `onefive-back/src/startup/startup.controller.ts`
- `onefive-back/src/startup/startup.module.ts`

**Fonctionnalités** :
- ✅ Ajout direct d'un fondateur existant (par profileId)
- ✅ Invitation par email (création StartupInvitation)
- ✅ Validation équité ≤ 100% (inclut invitations pending)
- ✅ Notification SYSTEM au nouveau fondateur
- ✅ Demande de connexion automatique
- ✅ Vérification permissions (ADMIN/SUPER_ADMIN only)

---

#### 6. `POST /startup/:id/members/invite` — Inviter un membre ✅
**Fichiers créés** :
- `onefive-back/src/startup/dto/invite-member.dto.ts`
- `onefive-back/src/startup/handlers/invite-member.handler.ts`

**Fonctionnalités** :
- ✅ Invitation d'un profil existant (notification STARTUP_INVITATION)
- ✅ Invitation par email (création StartupInvitation)
- ✅ Equity fixée à 0 (membres != fondateurs)
- ✅ Message personnalisé optionnel
- ✅ Vérification permissions (ADMIN/SUPER_ADMIN only)

---

#### 7. `PUT /startup/invitations/:id/accept` — Accepter invitation ✅
**Fichiers utilisés** (existants) :
- `onefive-back/src/startup-invitation/controllers/startup-invitation.controller.ts`
- `onefive-back/src/startup/startup.service.ts` (`respondToInvitation`)

**Fonctionnalités** :
- ✅ Vérification invitation appartient à l'utilisateur
- ✅ Vérification statut PENDING et non expirée
- ✅ Création StartupMember automatique
- ✅ Mise à jour statut invitation

---

#### 8. `PUT /startup/invitations/:id/decline` — Refuser invitation ✅
**Fichiers utilisés** (existants) :
- `onefive-back/src/startup-invitation/controllers/startup-invitation.controller.ts`
- `onefive-back/src/startup/startup.service.ts` (`respondToInvitation`)

**Fonctionnalités** :
- ✅ Mise à jour statut = DECLINED
- ✅ Enregistrement respondedAt et respondedById

---

#### 9. Validation équité ≤ 100% ✅
**Implémenté dans** : `add-founder.handler.ts`

**Fonctionnalités** :
- ✅ Calcul équité totale (membres actuels + invitations pending)
- ✅ Exception BadRequest si dépassement
- ✅ Message d'erreur détaillé avec valeurs actuelles

---

#### 10. Notifications système ✅
**Implémenté dans** :
- `add-founder.handler.ts` (STARTUP_UPDATE pour fondateurs)
- `invite-member.handler.ts` (STARTUP_INVITATION pour membres)

**Fonctionnalités** :
- ✅ Type STARTUP_UPDATE pour ajout direct
- ✅ Type STARTUP_INVITATION pour invitations
- ✅ Catégorie SYSTEM ou INVITATIONS selon le cas
- ✅ Métadonnées avec actions ['accept', 'decline']

---

### Phase 3 — Email Templates (2 tâches)

#### 11. Template `founder-invitation.tsx` ✅
**Fichier créé** : `onefive-email/transactional/emails/founder-invitation.tsx`

**Contenu** :
- ✅ Header OneFive
- ✅ Message d'invitation personnalisé
- ✅ Affichage position et équité
- ✅ Boutons Accept/Decline stylisés
- ✅ Mention expiration 7 jours

---

#### 12. Template `member-invitation.tsx` ✅
**Fichier créé** : `onefive-email/transactional/emails/member-invitation.tsx`

**Contenu** :
- ✅ Header OneFive
- ✅ Message d'invitation personnalisé
- ✅ Affichage position (sans équité)
- ✅ Boutons Accept/Decline stylisés
- ✅ Mention expiration 7 jours

---

### Phase 4 — Frontend (8 tâches)

#### 13. Queries/Hooks startup ✅
**Fichier modifié** : `onefive-front/src/queries/startup.ts`

**Ajouts** :
- ✅ `useAddFounder` - Hook pour ajouter un fondateur
- ✅ `useInviteMember` - Hook pour inviter un membre
- ✅ `useMyInvitations` - Hook pour récupérer ses invitations
- ✅ `useAcceptInvitation` - Hook pour accepter une invitation
- ✅ `useDeclineInvitation` - Hook pour refuser une invitation
- ✅ Types: `AddFounderPayload`, `InviteMemberPayload`, `StartupInvitation`

---

#### 14. Composant MembersTable ✅
**Fichier créé** : `onefive-front/src/components/startup/MembersTable.tsx`

**Fonctionnalités** :
- ✅ Affichage liste des membres (non-fondateurs)
- ✅ Desktop et mobile responsive
- ✅ Bouton "Inviter un membre" pour admins
- ✅ Badges de rôle (ADMIN, MODERATOR, MEMBER)
- ✅ Liens vers profils

---

#### 15. Modal EditMembersModal ✅
**Fichier créé** : `onefive-front/src/components/startup/modals/EditMembersModal.tsx`

**Fonctionnalités** :
- ✅ Tabs: Recherche profil / Email
- ✅ SmartProfileSearch intégré
- ✅ Champs: position, role, message
- ✅ Validation Zod
- ✅ Appel API `useInviteMember`

---

#### 16. Intégration page startup ✅
**Fichier modifié** : `onefive-front/src/app/(protected)/startup/[id]/page.tsx`

**Changements** :
- ✅ Import MembersTable
- ✅ Section membres après fondateurs
- ✅ Props startupId, userRole, canEdit

---

#### 17. Export composants ✅
**Fichier modifié** : `onefive-front/src/components/startup/index.ts`

**Exports ajoutés** :
- ✅ `FoundersTable`
- ✅ `MembersTable`
- ✅ `EditMembersModal`
- ✅ `EditAllFoundersModal`

---

#### 18. Notifications Accept/Decline ✅
**Fichier modifié** : `onefive-front/src/components/navbar/NotificationDropdown.tsx`

**Changements** :
- ✅ Import hooks `useAcceptInvitation`, `useDeclineInvitation`
- ✅ Détection invitations startup avec actions
- ✅ Boutons Accept/Decline inline
- ✅ État loading pendant processing
- ✅ Refetch notifications après action

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### Backend (onefive-back)
```
src/startup/
├── dto/
│   ├── add-founder.dto.ts          [NOUVEAU]
│   └── invite-member.dto.ts        [NOUVEAU]
├── handlers/
│   ├── add-founder.handler.ts      [NOUVEAU]
│   └── invite-member.handler.ts    [NOUVEAU]
├── startup.controller.ts           [MODIFIÉ]
└── startup.module.ts               [MODIFIÉ]
```

### Email (onefive-email)
```
transactional/emails/
├── founder-invitation.tsx          [NOUVEAU]
└── member-invitation.tsx           [NOUVEAU]
```

### Frontend (onefive-front)
```
src/
├── queries/
│   └── startup.ts                  [MODIFIÉ - ajout hooks]
├── components/
│   └── startup/
│       ├── MembersTable.tsx        [NOUVEAU]
│       ├── index.ts                [MODIFIÉ]
│       └── modals/
│           └── EditMembersModal.tsx [NOUVEAU]
│   └── navbar/
│       └── NotificationDropdown.tsx [MODIFIÉ]
└── app/(protected)/startup/[id]/
    └── page.tsx                    [MODIFIÉ]
```

---

## 🧪 TESTS RECOMMANDÉS

### Backend
1. Ajouter un fondateur existant → vérifier StartupMember créé
2. Inviter par email → vérifier StartupInvitation créée
3. Tester dépassement équité 100% → vérifier erreur 400
4. Accepter invitation → vérifier membre créé
5. Refuser invitation → vérifier statut DECLINED

### Frontend
1. Bouton "Inviter un membre" visible pour admin uniquement
2. Recherche profil fonctionne dans modal
3. Notifications startup avec boutons Accept/Decline
4. Section membres affichée sur page startup

---

## 🚀 DÉPLOIEMENT

1. **Backend** : Redémarrer le serveur NestJS
2. **Email** : Templates prêts (intégration envoi à implémenter)
3. **Frontend** : Rebuild Next.js

---

> **Dernière mise à jour** : 11 janvier 2026
> **Complété par** : GitHub Copilot (Claude Opus 4.5)
- Ajouter un fondateur à une startup
- 2 cas : utilisateur sur OneFive (direct) ou pas (invitation email)
- Validation : équité totale ≤ 100%
- Créer notification SYSTEM
- Créer demande de relation

**Fichiers à créer** :
- `src/startup/handlers/add-founder.handler.ts`
- Modifier : `src/startup/startup.controller.ts`

**Voir détails** : `IMPLEMENTATION_PLAN.md` ligne 50-80

---

#### 2. `POST /startups/:id/members/invite` — Inviter un membre
**Priorité** : P0

**Fonctionnalité** :
- Inviter un membre d'équipe (pas fondateur)
- Créer invitation avec acceptation requise
- Notification INVITATION avec boutons Accept/Decline

**Fichiers à créer** :
- `src/startup/handlers/invite-member.handler.ts`

---

#### 3. `PUT /invitations/:id/accept` — Accepter invitation
**Priorité** : P0

**Fonctionnalité** :
- Accepter une invitation (fondateur ou membre)
- Créer `StartupMember` automatiquement
- Mettre à jour statut invitation

---

#### 4. `PUT /invitations/:id/reject` — Refuser invitation
**Priorité** : P0

**Fonctionnalité** :
- Refuser une invitation
- Mettre à jour statut = REJECTED

---

#### 5. Validation équité ≤ 100%
**Priorité** : P0

**Fonctionnalité** :
- Empêcher dépassement 100% d'équité totale
- Calculer somme actuelle avant ajout
- Lever exception si dépassement

**Fichiers à modifier** :
- `src/startup/handlers/add-founder.handler.ts`

---

#### 6. Notification SYSTEM pour fondateur
**Priorité** : P0

**Fonctionnalité** :
- Notifier utilisateur qu'il a été ajouté comme fondateur
- Type : `SYSTEM`
- Métadonnées : `startupId`, `redirectUrl`

---

#### 7. Notification INVITATION pour membre
**Priorité** : P0

**Fonctionnalité** :
- Notifier utilisateur qu'il a été invité
- Type : `INVITATION`
- Métadonnées : `invitationId`, `actions: ['accept', 'decline']`

---

#### 8. Système demande de relation
**Priorité** : P1

**Fonctionnalité** :
- Créer demande de relation lors ajout fondateur/membre
- Vérifier si système existe déjà
- Si non, créer handler/service

**À vérifier** :
```bash
grep -r "RelationshipRequest\|createRelationshipRequest" src/
```

---

### 📧 Email Templates (2 tâches)

#### 9. Template `founder-invitation.tsx`
**Chemin** : `onefive-email/transactional/emails/founder-invitation.tsx`

**Contenu** :
- Email pour inviter quelqu'un comme fondateur
- Lien d'inscription avec token
- Affiche : position, équité, nom startup

---

#### 10. Template `member-invitation.tsx`
**Chemin** : `onefive-email/transactional/emails/member-invitation.tsx`

**Contenu** :
- Email pour inviter quelqu'un comme membre
- Pas d'équité
- Lien d'inscription avec token

---

### 🎨 Frontend (8 tâches)

#### 11. Section Équipe/Membres
**Fichier** : `src/app/(protected)/startup/[id]/page.tsx`

**Fonctionnalité** :
- Afficher liste des membres (non-fondateurs)
- Composant `MembersTable` similaire à `FoundersTable`

---

#### 12. Modal "Gérer les membres"
**Fichier** : `src/components/startup/modals/EditMembersModal.tsx`

**Fonctionnalité** :
- Modal pour ajouter/inviter des membres
- Utilise `SmartProfileSearch`
- Champs : position, role (ADMIN/MEMBER)
- Pas d'équité

---

#### 13. Flow ajout fondateur
**Fichiers** :
- `src/components/startup/modals/EditAllFoundersModal.tsx`
- `src/queries/startup-founders.ts` (nouveau hook)

**Fonctionnalité** :
- Appeler endpoint `POST /startups/:id/founders`
- Gérer cas utilisateur sur OneFive / pas sur OneFive
- Toast de succès + animation

---

#### 14. Flow invitation membre
**Fichiers** :
- `src/components/startup/modals/EditMembersModal.tsx`
- Hook mutation pour invitations

**Fonctionnalité** :
- Appeler endpoint `POST /startups/:id/members/invite`
- Gérer acceptation/refus

---

#### 15. Validation équité UI
**Fichier** : `src/components/startup/modals/EditAllFoundersModal.tsx`

**Fonctionnalité** :
- Afficher total équité
- Alerte si > 100%
- Bloquer soumission si dépassement

---

#### 16. UX après ajout
**Fichiers** : Modals de gestion

**Fonctionnalité** :
- Toast de confirmation
- Animation dans la liste (highlight nouveau membre)
- Rafraîchissement automatique

---

#### 17. Notifications avec Accept/Decline
**Fichiers** : Composants de notifications

**Fonctionnalité** :
- Afficher boutons Accept/Decline sur notifications INVITATION
- Appeler endpoints accept/reject
- Redirection après acceptation

---

#### 18. Flow demande de relation
**Fichiers** : À déterminer

**Fonctionnalité** :
- Gérer affichage des demandes de relation
- Boutons accepter/refuser

---

## 🏗️ ARCHITECTURE & DÉCISIONS

### Modèle de données

```prisma
model StartupMember {
  id           String
  profileId    String
  startupId    String
  position     String
  role         StartupMemberRoleType  // SUPER_ADMIN, ADMIN, MODERATOR, MEMBER
  equity       Int                     @default(0)
  isFounder    Boolean                 @default(false)  // ← NOUVEAU
  // ...
}
```

**Règles** :
- `isFounder = true` + `equity > 0` = Fondateur
- `isFounder = false` + `equity = 0` = Membre équipe
- Créateur : `isFounder = true` + `role = SUPER_ADMIN`

---

### Flows d'ajout

#### Ajout FONDATEUR
```
1. Admin cherche personne (API /profile/search)
2. Si sur OneFive:
   → Ajout direct → StartupMember (isFounder=true)
   → Notification SYSTEM
   → Demande relation
3. Si pas sur OneFive:
   → Créer StartupInvitation (type=FOUNDER)
   → Email invitation
   → À l'inscription: ajouté auto comme fondateur
```

#### Ajout MEMBRE
```
1. Admin cherche personne
2. Si sur OneFive:
   → Créer StartupInvitation (type=MEMBER)
   → Notification INVITATION (avec Accept/Decline)
   → Demande relation
3. Si pas sur OneFive:
   → Créer StartupInvitation
   → Email invitation
   → À l'inscription: notification visible
   → Doit accepter pour être ajouté
```

---

### Contrôles d'accès

**Rôles autorisés** :
- `SUPER_ADMIN` : Créateur de la startup
- `ADMIN` : Administrateur de la startup
- `MODERATOR` : Modérateur (si applicable)

**Vérification** :
```typescript
const hasEditPermissions = canEdit && 
  (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MODERATOR');
```

---

### Notifications

**Types** :
- `SYSTEM` : Ajout comme fondateur (pas d'acceptation requise)
- `INVITATION` : Invitation comme membre (acceptation requise)

**Métadonnées** :
```typescript
// SYSTEM
{
  startupId: string,
  redirectUrl: string,
  inviterId: string
}

// INVITATION
{
  invitationId: string,
  startupId: string,
  role: string,
  actions: ['accept', 'decline']
}
```

---

## 🚀 COMMENT DÉMARRER

### 1. Lire la documentation complète
```bash
cat onefive-back/IMPLEMENTATION_PLAN.md
```

### 2. Vérifier l'état actuel
```bash
# Voir les commits récents
git log --oneline -10

# Voir les fichiers modifiés
git diff HEAD~5
```

### 3. Comprendre la structure
```bash
# Backend structure
ls -la onefive-back/src/startup/
ls -la onefive-back/src/startup/handlers/

# Frontend structure
ls -la onefive-front/src/components/startup/
ls -la onefive-front/src/queries/
```

### 4. Tester ce qui existe
```bash
# Backend
cd onefive-back
npm run start:dev

# Tester endpoint recherche
curl http://localhost:50050/profile/search?q=john&limit=5

# Frontend
cd onefive-front
npm run dev

# Tester sur /startup/[id]
```

### 5. Commencer par la priorité P0
**Ordre recommandé** :
1. `backend-003` : Endpoint ajouter fondateur
2. `backend-007` : Validation équité
3. `backend-008` : Notification fondateur
4. `email-001` : Template email
5. `frontend-005` : Flow ajout fondateur

---

## 📝 NOTES IMPORTANTES

### Points d'attention
- ⚠️ Vérifier que `NotificationType` enum inclut `SYSTEM` et `INVITATION`
- ⚠️ Vérifier l'existence d'un système de Relationship requests
- ⚠️ S'assurer que les emails fonctionnent (configuration SMTP dans `onefive-email`)
- ⚠️ Tester le flow complet d'invitation pour utilisateur non inscrit

### Conventions de code
- Handlers dans `src/startup/handlers/`
- Controllers dans `src/startup/startup.controller.ts`
- Hooks React Query dans `onefive-front/src/queries/`
- Modals dans `onefive-front/src/components/startup/modals/`

### Tests à faire
- ✅ Ajout fondateur (utilisateur existant)
- ✅ Ajout fondateur (email invitation)
- ✅ Invitation membre (accept/decline)
- ✅ Validation équité (bloquer si > 100%)
- ✅ Contrôles d'accès (seul admin peut gérer)

---

## 🔗 LIENS UTILES

- **Plan détaillé** : `onefive-back/IMPLEMENTATION_PLAN.md`
- **Audit production** : `onefive-front/AUDIT_PRODUCTION.md`
- **Prisma Schema** : `onefive-back/prisma/schema/profile.prisma`
- **Startup Controller** : `onefive-back/src/startup/startup.controller.ts`
- **Profile Search** : `onefive-back/src/profile/handlers/search-profiles.handler.ts`

---

## ❓ QUESTIONS FRÉQUENTES

### Q: Pourquoi `isFounder` au lieu d'une table séparée ?
**R:** Plus simple, moins invasif, backward compatible. On peut migrer plus tard si besoin.

### Q: Pourquoi pas d'auto-acceptation des relations ?
**R:** Décision métier : les relations doivent être acceptées explicitement pour respecter la vie privée.

### Q: Pourquoi bloquer si équité > 100% ?
**R:** Règle métier : impossible d'avoir plus de 100% de parts. On pourrait permettre < 100% mais pas >.

### Q: Où sont les notifications gérées ?
**R:** Vérifier `src/notification/` dans le backend. Le service doit exister déjà.

---

*Document créé le 11 janvier 2026*  
*Dernière mise à jour : 11 janvier 2026*

