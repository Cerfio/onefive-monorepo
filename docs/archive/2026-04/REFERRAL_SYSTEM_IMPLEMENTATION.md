# Intégration Backend Système de Parrainage (Referral)

## Résumé des changements

Cette mise à jour connecte la page `/invite` du frontend avec le backend à 100%.

## Fichiers créés (Backend)

### 1. Schéma Prisma
- `prisma/schema/referral.prisma` - Modèles `Referral` et `ReferralStats` + enum `ReferralStatus`

### 2. Module NestJS Referral
- `src/referral/referral.module.ts` - Module principal
- `src/referral/referral.service.ts` - Logique métier (calcul des tiers, stats, leaderboard)
- `src/referral/referral.controller.ts` - Endpoints REST API
- `src/referral/dto/send-invitation.dto.ts` - DTO de validation

### 3. Handlers
- `src/referral/handlers/send-invitation.handler.ts` - Envoi d'invitations
- `src/referral/handlers/get-stats.handler.ts` - Récupération des statistiques
- `src/referral/handlers/get-leaderboard.handler.ts` - Récupération du leaderboard
- `src/referral/handlers/get-my-referrals.handler.ts` - Liste des parrainages de l'utilisateur

## Fichiers modifiés (Backend)

- `prisma/schema/user.prisma` - Ajout relation `referralReceived`
- `prisma/schema/profile.prisma` - Ajout relations `referralsMade` et `referralStats`
- `src/app.module.ts` - Enregistrement du `ReferralModule`

## Fichiers créés (Frontend)

- `src/hooks/useReferral.ts` - Hook React Query pour les appels API

## Fichiers modifiés (Frontend)

- `src/app/(protected)/invite/page.tsx` - Remplacement des données mockées par les appels API réels

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/referral/invite` | Envoyer une invitation de parrainage |
| GET | `/referral/stats` | Récupérer les stats de l'utilisateur connecté |
| GET | `/referral/leaderboard?limit=10` | Récupérer le top des parrains |
| GET | `/referral/my-referrals` | Récupérer la liste de ses parrainages |

## Système de paliers (Tiers)

| Tier | Parrainages requis |
|------|-------------------|
| Starter | 0 |
| Bronze | 3 |
| Silver | 10 |
| Gold | 25 |
| Platinum | 50 |
| Diamond | 100 |

## Migration Base de données

La migration a été appliquée avec `prisma db push`. Pour créer une migration propre :

```bash
cd onefive-back
pnpm prisma migrate dev --name add_referral_system
```

## À faire (TODO)

1. **Envoi d'emails** : Implémenter l'envoi réel des emails d'invitation dans `send-invitation.handler.ts`
2. **Acceptation automatique** : Créer un handler qui détecte quand un utilisateur invité s'inscrit et marque le referral comme accepté
3. **Expiration** : Ajouter un job cron pour expirer les invitations après X jours
4. **Tests** : Ajouter des tests unitaires et e2e pour le module referral

## Utilisation

Le frontend utilise React Query pour gérer le cache et les requêtes :

```typescript
// Dans un composant React
import { useReferralStats, useLeaderboard, useSendInvitation } from '@/hooks/useReferral';

function MyComponent() {
  const { data: stats, isLoading } = useReferralStats();
  const { data: leaderboard } = useLeaderboard(5);
  const sendInvitation = useSendInvitation();
  
  const handleInvite = async (email: string) => {
    await sendInvitation.mutateAsync(email);
  };
}
```
