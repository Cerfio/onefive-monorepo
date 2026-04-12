# 📋 PLAN D'IMPLÉMENTATION — Gestion Fondateurs/Membres

> **Date** : 11 janvier 2026  
> **Statut** : En cours  
> **Progression** : 4/23 tâches complétées (17%)

---

## ✅ TÂCHES COMPLÉTÉES

### Frontend
- ✅ **frontend-001** : Remplacer MOCK_PROFILES par API réelle (SmartProfileSearch + ProfileSearch)
- ✅ **frontend-002** : Contrôle d'accès bouton "Gérer fondateurs" (admin/super_admin)

### Backend
- ✅ **backend-001** : Ajout champ `isFounder` à StartupMember (migration Prisma)
- ✅ **backend-002** : Endpoint `/profile/search` vérifié (existe et fonctionne)

---

## 🚧 TÂCHES EN COURS

### 🔴 P0 — Critique (Bloquant fonctionnalité)

#### backend-003 : Endpoint POST /startups/:id/founders
**Objectif** : Ajouter un fondateur à une startup

**Spécifications** :
```typescript
POST /startups/:id/founders
Body: {
  profileId?: string,           // Si sur OneFive
  email?: string,               // Si pas sur OneFive
  firstName?: string,           // Si pas sur OneFive
  lastName?: string,            // Si pas sur OneFive
  position: string,
  equity: number
}

Response: {
  success: boolean,
  data: StartupMember
}
```

**Logique métier** :
1. Vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
2. Valider que l'équité totale ne dépasse pas 100%
3. Si `profileId` fourni :
   - Créer `StartupMember` avec `isFounder = true`
   - Créer notification SYSTEM pour le fondateur
   - Créer demande de relation
4. Si `email` fourni (pas sur OneFive) :
   - Créer `StartupInvitation` avec type FOUNDER
   - Envoyer email d'invitation
   - Token expiration: 7 jours

**Fichiers à créer/modifier** :
- `src/startup/handlers/add-founder.handler.ts` (nouveau)
- `src/startup/startup.controller.ts` (ajouter endpoint)
- `src/startup/startup.module.ts` (register handler)

---

#### backend-004 : Endpoint POST /startups/:id/members/invite
**Objectif** : Inviter un membre (équipe) à une startup

**Spécifications** :
```typescript
POST /startups/:id/members/invite
Body: {
  profileId?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  position: string,
  role: 'ADMIN' | 'MEMBER'
}

Response: {
  success: boolean,
  data: StartupInvitation
}
```

**Logique métier** :
1. Vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
2. Créer `StartupInvitation` avec :
   - `role` = body.role
   - `equity` = 0
   - Status PENDING
3. Si `profileId` fourni :
   - Créer notification INVITATION
   - Créer demande de relation
4. Si `email` fourni :
   - Envoyer email d'invitation membre

**Fichiers à créer/modifier** :
- `src/startup/handlers/invite-member.handler.ts` (nouveau)
- `src/startup/startup.controller.ts` (ajouter endpoint)

---

#### backend-005 : Endpoint PUT /invitations/:id/accept
**Objectif** : Accepter une invitation

**Spécifications** :
```typescript
PUT /invitations/:id/accept

Response: {
  success: boolean,
  data: {
    startupMember: StartupMember,
    invitation: StartupInvitation
  }
}
```

**Logique métier** :
1. Vérifier que l'invitation existe et est PENDING
2. Vérifier que l'utilisateur est le destinataire
3. Créer `StartupMember` avec :
   - `isFounder` = (invitation.role === FOUNDER)
   - `role` = invitation.role
   - `equity` = invitation.equity
4. Mettre à jour invitation status = ACCEPTED
5. Marquer notification comme lue

**Fichiers à créer/modifier** :
- `src/startup/handlers/accept-invitation.handler.ts` (nouveau)
- `src/startup/startup.controller.ts` (ajouter endpoint)

---

#### backend-006 : Endpoint PUT /invitations/:id/reject
**Objectif** : Refuser une invitation

**Spécifications** :
```typescript
PUT /invitations/:id/reject

Response: {
  success: boolean,
  data: StartupInvitation
}
```

**Logique métier** :
1. Vérifier que l'invitation existe et est PENDING
2. Vérifier que l'utilisateur est le destinataire
3. Mettre à jour status = REJECTED
4. Marquer notification comme lue

**Fichiers à créer/modifier** :
- `src/startup/handlers/reject-invitation.handler.ts` (nouveau)
- `src/startup/startup.controller.ts` (ajouter endpoint)

---

#### backend-007 : Validation équité ≤ 100%
**Objectif** : Empêcher de dépasser 100% d'équité totale

**Implémentation** :
```typescript
// Dans add-founder.handler.ts
const totalEquity = await this.prisma.startupMember.aggregate({
  where: {
    startupId,
    isFounder: true,
  },
  _sum: { equity: true }
});

const currentTotal = totalEquity._sum.equity || 0;
const newTotal = currentTotal + body.equity;

if (newTotal > 100) {
  throw new BadRequestException(
    `L'équité totale dépasserait 100% (actuel: ${currentTotal}%, ajouté: ${body.equity}%)`
  );
}
```

**Fichiers à modifier** :
- `src/startup/handlers/add-founder.handler.ts`
- `src/startup/handlers/update-founder.handler.ts` (si existe)

---

#### backend-008 : Notification SYSTEM pour ajout fondateur
**Objectif** : Notifier un utilisateur qu'il a été ajouté comme fondateur

**Spécifications** :
```typescript
await this.notificationService.create({
  userId: profileId,
  type: 'SYSTEM',
  title: 'Vous avez été ajouté comme fondateur',
  message: `${inviter.firstName} ${inviter.lastName} vous a ajouté comme fondateur de ${startup.name}`,
  metadata: {
    startupId: startup.id,
    redirectUrl: `/startup/${startup.id}`,
    inviterId: userId
  }
});
```

**Fichiers à modifier** :
- `src/startup/handlers/add-founder.handler.ts`
- Vérifier enum NotificationType dans Prisma

---

#### backend-009 : Notification INVITATION pour membre
**Objectif** : Notifier un utilisateur qu'il a été invité comme membre

**Spécifications** :
```typescript
await this.notificationService.create({
  userId: profileId,
  type: 'INVITATION',
  title: 'Invitation à rejoindre une startup',
  message: `${inviter.firstName} ${inviter.lastName} vous invite à rejoindre ${startup.name} comme ${position}`,
  metadata: {
    invitationId: invitation.id,
    startupId: startup.id,
    role: invitation.role,
    actions: ['accept', 'decline']
  }
});
```

**Fichiers à modifier** :
- `src/startup/handlers/invite-member.handler.ts`

---

#### backend-010 : Système demande de relation
**Objectif** : Créer une demande de relation lors de l'ajout fondateur/membre

**Vérifier si existe** :
```bash
grep -r "RelationshipRequest\|createRelationshipRequest" src/
```

**Si n'existe pas, créer** :
```typescript
// src/relationship/handlers/create-relationship-request.handler.ts
await this.prisma.relationship.create({
  data: {
    fromId: userId,
    toId: profileId,
    status: 'PENDING',
    type: 'CONNECTION'
  }
});
```

**Fichiers à créer/modifier** :
- Vérifier si `Relationship` model a un champ `status`
- Si non, migration nécessaire
- `src/startup/handlers/add-founder.handler.ts`
- `src/startup/handlers/invite-member.handler.ts`

---

### 📧 Email Templates

#### email-001 : Template founder-invitation.tsx
**Chemin** : `onefive-email/transactional/emails/founder-invitation.tsx`

**Contenu** :
```tsx
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr } from '@react-email/components';

interface FounderInvitationEmailProps {
  inviterName: string;
  startupName: string;
  position: string;
  equity: number;
  invitationUrl: string;
}

export const FounderInvitationEmail = ({
  inviterName,
  startupName,
  position,
  equity,
  invitationUrl,
}: FounderInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Vous avez été ajouté comme fondateur de {startupName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Vous êtes maintenant fondateur !</Text>
        <Text style={paragraph}>
          {inviterName} vous a ajouté comme fondateur de <strong>{startupName}</strong>.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailLabel}>Position</Text>
          <Text style={detailValue}>{position}</Text>
          <Text style={detailLabel}>Parts</Text>
          <Text style={detailValue}>{equity}%</Text>
        </Section>
        <Button href={invitationUrl} style={button}>
          Créer mon compte OneFive
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          Ce lien expire dans 7 jours. Si vous avez déjà un compte, connectez-vous pour voir votre startup.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Styles...
```

---

#### email-002 : Template member-invitation.tsx
**Chemin** : `onefive-email/transactional/emails/member-invitation.tsx`

**Contenu** : Similaire à founder-invitation mais avec :
- Titre : "Invitation à rejoindre {startupName}"
- Pas de mention d'équité
- Message : "vous invite à rejoindre l'équipe"
- CTA : "Accepter l'invitation"

---

### 🎨 Frontend

#### frontend-003 : Section Équipe/Membres
**Fichiers à modifier** :
- `src/app/(protected)/startup/[id]/page.tsx`

**Ajouter après FoundersTable** :
```tsx
<MembersTable 
  members={startupData.members}
  userRole={startup?.role}
  canEdit={startup?.canEdit}
/>
```

---

#### frontend-004 : Modal Gérer les membres
**Créer** : `src/components/startup/modals/EditMembersModal.tsx`

Similaire à `EditAllFoundersModal` mais :
- Titre : "Gérer les membres de l'équipe"
- Champs : position, role (ADMIN/MEMBER)
- Pas d'équité
- Appelle endpoint `/startups/:id/members/invite`

---

#### frontend-005 : Flow ajout fondateur
**Fichiers à modifier** :
- `src/components/startup/modals/EditAllFoundersModal.tsx`
- Créer hook : `src/queries/startup-founders.ts`

**Hook** :
```typescript
export const useAddFounder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ startupId, data }) => {
      const response = await ky.post(
        `${process.env.NEXT_PUBLIC_API_URL}/startups/${startupId}/founders`,
        { json: data }
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success('Fondateur ajouté avec succès');
      queryClient.invalidateQueries(['startup', variables.startupId]);
    }
  });
};
```

---

## 📊 ESTIMATION TEMPS RESTANT

| Catégorie | Tâches restantes | Temps estimé |
|-----------|:----------------:|:------------:|
| Backend | 8 | 4-6 jours |
| Email | 2 | 1 jour |
| Frontend | 8 | 3-5 jours |
| **TOTAL** | **18** | **8-12 jours** |

---

## 🎯 PRIORITÉS RECOMMANDÉES

### Sprint 1 (2-3 jours) - Fondations
1. backend-003 : Endpoint ajouter fondateur
2. backend-007 : Validation équité
3. backend-008 : Notification fondateur
4. email-001 : Template email fondateur
5. frontend-005 : Flow ajout fondateur

### Sprint 2 (2-3 jours) - Membres
6. backend-004 : Endpoint inviter membre
7. backend-009 : Notification membre
8. email-002 : Template email membre
9. frontend-003 : Section membres
10. frontend-004 : Modal membres

### Sprint 3 (2-3 jours) - Invitations
11. backend-005 : Accepter invitation
12. backend-006 : Refuser invitation
13. frontend-006 : Flow invitation
14. frontend-009 : Notifications avec boutons

### Sprint 4 (2-3 jours) - Polish
15. backend-010 : Demandes relation
16. frontend-007 : Validation équité UI
17. frontend-008 : UX animations
18. frontend-010 : Flow demandes relation

---

## 📝 NOTES IMPORTANTES

### Décisions architecturales prises
- **isFounder** : Champ Boolean ajouté à StartupMember pour distinguer fondateurs/membres
- **equity** : Default 0 pour les membres non-fondateurs
- **Relations** : Via demandes (PENDING → ACCEPTED), pas d'auto-ajout
- **Notifications** : SYSTEM pour fondateurs, INVITATION pour membres

### Points d'attention
- ⚠️ Vérifier que NotificationType inclut 'SYSTEM' et 'INVITATION'
- ⚠️ Vérifier l'existence d'un système de Relationship requests
- ⚠️ S'assurer que les emails fonctionnent (configuration SMTP)
- ⚠️ Tester le flow complet d'invitation pour utilisateur non inscrit

---

## 🔗 LIENS UTILES

- [Prisma Schema](prisma/schema/profile.prisma)
- [Startup Controller](src/startup/startup.controller.ts)
- [Profile Search Handler](src/profile/handlers/search-profiles.handler.ts)
- [Notification Service](src/notification/) 

---

*Document généré automatiquement le 11 janvier 2026*

