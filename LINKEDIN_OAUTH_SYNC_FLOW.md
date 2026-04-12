# 🔗 LinkedIn OAuth + Sync Flow

## 📋 Vue d'ensemble

Ce document décrit le flow complet d'intégration LinkedIn depuis l'authentification OAuth jusqu'à la synchronisation du profil.

## 🎯 Fonctionnalités

### 1. **Authentification LinkedIn (OAuth2)**
Lors du signup/signin avec LinkedIn :
- ✅ L'utilisateur s'authentifie via LinkedIn OAuth2
- ✅ On récupère les informations de base : `email`, `name`, `picture`, etc.
- ✅ **NOUVEAU** : On récupère aussi le `vanityName` (nom public du profil)
- ✅ On construit l'URL LinkedIn : `https://www.linkedin.com/in/{vanityName}`
- ✅ On stocke cette URL dans le profil de l'utilisateur (champ `linkedinUrl`)

### 2. **Synchronisation du profil LinkedIn**
Quand l'utilisateur clique sur "Synchroniser avec LinkedIn" :
- ✅ L'URL LinkedIn est **automatiquement récupérée** depuis le profil
- ✅ Si l'URL n'existe pas (utilisateur non connecté via LinkedIn OAuth), l'utilisateur peut la saisir manuellement
- ✅ Un scraping est lancé via l'API Apify pour récupérer le profil complet
- ✅ Les données brutes sont stockées dans la table `LinkedInSync`
- ✅ Une comparaison côte à côte est affichée sur le frontend
- ✅ L'utilisateur peut sélectionner les champs à synchroniser
- ✅ Rate limit : 1 synchronisation toutes les 24 heures

## 🔄 Flow détaillé

### Étape 1 : Auth LinkedIn (Backend)

```typescript
// 1. LinkedIn OAuth redirect
POST /auth/linkedin
Body: { code: "auth_code_from_linkedin" }

// 2. Le LinkedinService récupère :
//    - Les infos de base via /v2/userinfo
//    - Le vanityName via /v2/me?projection=(vanityName)
//    - Construit l'URL : https://www.linkedin.com/in/{vanityName}

// 3. Le AuthLinkedinHandler :
//    - Crée ou met à jour l'utilisateur
//    - Appelle UsersService.updateLinkedInUrl() pour stocker l'URL dans le profil
```

**Fichiers modifiés :**
- `src/linkedin/linkedin.service.ts` : Ajout de la récupération du `vanityName`
- `src/auth/handlers/auth-linkedin.handler.ts` : Ajout de l'appel à `updateLinkedInUrl`
- `src/users/users.service.ts` : Nouvelle méthode `updateLinkedInUrl`

### Étape 2 : Synchronisation du profil

```typescript
// 1. L'utilisateur clique sur "Synchroniser avec LinkedIn"
POST /linkedin-sync/initiate
Body: { linkedinUrl?: string } // Optionnel !

// 2. Le InitiateLinkedInSyncHandler :
//    - Récupère le profil avec le champ linkedinUrl
//    - Utilise linkedinUrl fourni OU linkedinUrl stocké
//    - Si aucune URL disponible : erreur
//    - Vérifie le rate limit (24h)
//    - Lance le scraping via ApifyService
//    - Stocke les données brutes dans LinkedInSync
//    - Retourne les données de comparaison

// 3. Le frontend affiche la comparaison
GET /linkedin-sync/comparison

// 4. L'utilisateur sélectionne les champs et applique
POST /linkedin-sync/apply
Body: {
  syncHeadline: true,
  syncBio: true,
  syncAvatar: true,
  syncCover: true,
  experiences: [{ syncAction: "add", ... }],
  educations: [{ syncAction: "update", ... }],
  skills: ["JavaScript", "TypeScript"]
}
```

**Fichiers modifiés :**
- `src/linkedin-sync/handlers/initiate-linkedin-sync.handler.ts` : Gestion de l'URL optionnelle
- `src/linkedin-sync/dto/linkedin-sync.dto.ts` : `linkedinUrl` devient optionnel

### Étape 3 : Schéma Prisma

```prisma
model Profile {
  // ... autres champs
  linkedinUrl  String?  @db.VarChar(500)  // 👈 NOUVEAU
  linkedInSync LinkedInSync?
}

model LinkedInSync {
  id                  String    @id @default(uuid())
  profileId           String    @unique
  linkedinUrl         String    @db.VarChar(500)
  rawJson             Json
  lastSyncAt          DateTime  @default(now())
  nextSyncAvailableAt DateTime
  avatarUrl           String?   @db.VarChar(500)
  coverUrl            String?   @db.VarChar(500)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  profile             Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
```

## 🎨 Expérience utilisateur

### Scénario 1 : Utilisateur connecté via LinkedIn OAuth
1. ✅ L'utilisateur s'authentifie avec LinkedIn
2. ✅ Son URL LinkedIn est automatiquement stockée
3. ✅ Il clique sur "Synchroniser avec LinkedIn"
4. ✅ **Aucun input manuel requis** - l'URL est déjà connue
5. ✅ Le scraping se lance directement

### Scénario 2 : Utilisateur connecté avec email/password
1. ✅ L'utilisateur s'est inscrit avec email/password
2. ✅ Il clique sur "Synchroniser avec LinkedIn"
3. ⚠️ Il doit saisir son URL LinkedIn (ex: `https://www.linkedin.com/in/yannis-coulibaly/`)
4. ✅ L'URL est validée et le scraping se lance
5. ✅ L'URL est stockée pour les prochaines synchronisations

### Scénario 3 : Modification manuelle de l'URL
1. ✅ L'utilisateur peut toujours fournir une URL différente
2. ✅ Si fournie, l'URL du body override l'URL stockée
3. ✅ L'URL fournie est mise à jour dans le profil

## 📊 Diagramme de flux

```
┌─────────────────────────────────────────────────────────────┐
│  AUTHENTIFICATION LINKEDIN (Une seule fois)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /auth/linkedin                                        │
│       ↓                                                     │
│  LinkedinService.getUserInfo()                              │
│       ↓                                                     │
│  GET /v2/userinfo (email, name, picture)                   │
│  GET /v2/me?projection=(vanityName) (vanityName)           │
│       ↓                                                     │
│  Construire: https://www.linkedin.com/in/{vanityName}      │
│       ↓                                                     │
│  UsersService.updateLinkedInUrl()                           │
│       ↓                                                     │
│  Profile.linkedinUrl = "https://linkedin.com/in/..."       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SYNCHRONISATION DU PROFIL (Tous les 24h max)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /linkedin-sync/initiate                               │
│  Body: { linkedinUrl?: string }                             │
│       ↓                                                     │
│  InitiateLinkedInSyncHandler                                │
│       ↓                                                     │
│  Récupérer Profile.linkedinUrl                              │
│       ↓                                                     │
│  URL = body.linkedinUrl || Profile.linkedinUrl             │
│       ↓                                                     │
│  Valider l'URL (regex + format)                            │
│       ↓                                                     │
│  Vérifier rate limit (24h)                                 │
│       ↓                                                     │
│  ApifyService.scrapeProfile(url)                            │
│       ↓                                                     │
│  Apify API → Raw JSON                                       │
│       ↓                                                     │
│  Stocker dans LinkedInSync.rawJson                          │
│       ↓                                                     │
│  Retourner comparison data                                  │
│       ↓                                                     │
│  Frontend affiche left/right comparison                     │
│       ↓                                                     │
│  POST /linkedin-sync/apply                                  │
│       ↓                                                     │
│  Mettre à jour Profile, Experience, Education, etc.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Variables d'environnement requises

```env
# LinkedIn OAuth2
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
AUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Apify API (pour le scraping)
APIFY_API_TOKEN=your_apify_token
APIFY_LINKEDIN_ACTOR_ID=harvestapi~linkedin-profile-scraper
```

## ✅ Avantages de cette approche

1. **Meilleure UX** : Pas besoin de saisir l'URL si connecté via LinkedIn
2. **Flexibilité** : Possibilité de saisir manuellement l'URL si nécessaire
3. **Persistance** : L'URL est stockée pour les futures synchronisations
4. **Cohérence** : Une seule source de vérité pour l'URL LinkedIn
5. **Rate limiting** : Protection contre les abus (1 sync / 24h)
6. **Data integrity** : Validation stricte des URLs LinkedIn

## 🚀 Prochaines étapes

- [ ] Tester le flow complet en dev
- [ ] Ajouter des tests E2E
- [ ] Configurer les scopes LinkedIn OAuth pour récupérer plus d'infos
- [ ] Ajouter un bouton "Changer d'URL LinkedIn" dans les settings
- [ ] Améliorer la gestion des erreurs Apify (rate limits, timeouts)

## 📝 Notes techniques

### Scopes LinkedIn OAuth requis

Pour récupérer le `vanityName`, assurez-vous d'avoir les scopes suivants :
- `openid`
- `profile`
- `email`
- `w_member_social` (optionnel, pour le vanityName)

### API LinkedIn utilisées

1. **`GET /v2/userinfo`** : Informations de base (OpenID Connect)
2. **`GET /v2/me?projection=(vanityName)`** : Nom public du profil

### Gestion des erreurs

- Si le `vanityName` n'est pas disponible : **non-bloquant** (log warning)
- Si l'URL LinkedIn n'est pas fournie ni stockée : **erreur 400**
- Si le rate limit est dépassé : **erreur 429**
- Si l'URL est invalide : **erreur 400**

## 🔗 Références

- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Apify LinkedIn Scraper](https://apify.com/harvestapi/linkedin-profile-scraper)
- [Prisma Schema Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)







