# LinkedIn Sync Feature - Test & Setup Guide

## 🎯 Vue d'ensemble

Ce module permet aux utilisateurs de synchroniser leur profil LinkedIn avec leur profil Onefive via l'API Apify.

## 📋 Prérequis

1. **Compte Apify**
   - Créer un compte sur [apify.com](https://apify.com)
   - Obtenir un API token dans [Console > Integrations](https://console.apify.com/account/integrations)
   - Vérifier que vous avez des crédits (environ $4 par 1000 profils)

2. **Actor Apify**
   - Actor utilisé : `harvestapi~linkedin-profile-scraper`
   - Mode : "Profile details no email ($4 per 1k)"

## 🧪 Test du scraping

### 1. Créer le fichier de configuration de test

```bash
cd onefive-back
cp .env.test.example .env.test
```

### 2. Ajouter votre token Apify

Éditer `.env.test` et ajouter votre token :

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Lancer le test

```bash
npm run test:apify
```

### 4. Vérifier les résultats

Le script va :
- ✅ Scraper le profil LinkedIn spécifié
- ✅ Afficher un résumé des données récupérées
- ✅ Sauvegarder le JSON complet dans `test-output.json`
- ✅ Afficher la durée du scraping

**Sortie attendue :**

```
🚀 Démarrage du test de scraping LinkedIn via Apify...
📍 URL cible: https://www.linkedin.com/in/yannis-coulibaly/
🎭 Actor ID: harvestapi~linkedin-profile-scraper

⏳ Lancement du scraping (cela peut prendre 1-2 minutes)...

✅ Scraping terminé avec succès ! (45.32s)
📊 Nombre de profils récupérés: 1

👤 === DONNÉES DU PROFIL ===
Nom: Yannis Coulibaly
Headline: Senior Backend Developer – French Government
LinkedIn URL: https://www.linkedin.com/in/yannis-coulibaly
...
```

## 🚀 Configuration Production

### Variables d'environnement

Ajouter dans `.env` :

```bash
# Apify LinkedIn Scraper
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
APIFY_LINKEDIN_ACTOR_ID=harvestapi~linkedin-profile-scraper
```

### Migration Prisma

Générer et appliquer la migration :

```bash
npm run db:migrate
# Nom suggéré : add_linkedin_sync
```

Cela va créer la table `LinkedInSync` pour stocker les données scrapées et la date de dernière synchronisation.

## 📡 Endpoints API

### 1. Initier le scraping

```bash
POST /linkedin-sync/initiate
Content-Type: application/json
Cookie: session=...

{
  "linkedinUrl": "https://www.linkedin.com/in/yannis-coulibaly"
}
```

**Réponse :**
- Données de comparaison LinkedIn vs profil actuel
- Limite : 1 scraping toutes les 24h par utilisateur

### 2. Récupérer la comparaison

```bash
GET /linkedin-sync/comparison
Cookie: session=...
```

**Réponse :**
- Données précédemment scrapées
- Statut de synchronisation (canSync, hoursRemaining)

### 3. Appliquer les changements

```bash
POST /linkedin-sync/apply
Content-Type: application/json
Cookie: session=...

{
  "syncHeadline": true,
  "syncBio": true,
  "syncAvatar": false,
  "syncCover": false,
  "syncSkills": true,
  "selectedSkills": ["Node.js", "NestJS", "React"],
  "syncExperiences": true,
  "selectedExperiences": [
    {
      "title": "Senior Backend Developer",
      "company": "DINUM",
      "city": "Paris",
      "from": "2025-09-01T00:00:00.000Z",
      "tags": ["NestJS"]
    }
  ],
  "syncEducation": true,
  "selectedEducation": [...]
}
```

## 🎨 Frontend

Le modal de comparaison se trouve dans :
- `onefive-front/src/components/profile/modals/LinkedInComparisonModal.tsx`

Accessible via :
- Menu dropdown du profil → "Synchroniser avec LinkedIn"

## 🔍 Structure des données

### LinkedIn Profile Schema

Les données suivantes sont extraites :

```typescript
{
  firstName: string;
  lastName: string;
  headline: string;
  about: string; // Bio
  location: {
    city: string;
    country: string;
  };
  photo: string; // Avatar URL
  coverPicture: {
    url: string;
  };
  experience: Array<{
    position: string;
    companyName: string;
    startDate: { month, year };
    endDate: { month, year };
    description: string;
    skills: string[];
  }>;
  education: Array<{
    schoolName: string;
    degree: string;
    fieldOfStudy: string;
    startDate: { month, year };
    endDate: { month, year };
  }>;
  skills: Array<{
    name: string;
    endorsements: string;
  }>;
}
```

## ⚠️ Limitations

1. **Rate Limiting**
   - 1 synchronisation toutes les 24h par utilisateur
   - Stocké dans la table `LinkedInSync.lastSyncedAt`

2. **Coût Apify**
   - ~$4 pour 1000 profils scrapés
   - Mode "Profile details no email" (pas d'email extrait)

3. **Timeout**
   - Timeout de 3 minutes pour le scraping
   - Si le profil est trop long, peut échouer

4. **Profils LinkedIn**
   - Le profil doit être public ou semi-public
   - Les profils complètement privés ne peuvent pas être scrapés

## 🐛 Troubleshooting

### Erreur 401 Unauthorized
- Vérifier que le token Apify est correct
- Vérifier que le token est bien dans les variables d'environnement

### Erreur 429 Too Many Requests
- L'utilisateur a déjà synchronisé dans les dernières 24h
- Vérifier `nextSyncAvailableAt` dans la réponse

### Timeout
- Le profil LinkedIn est trop volumineux
- Augmenter le timeout dans `apify.service.ts`

### Profil non trouvé
- Vérifier que l'URL LinkedIn est correcte
- Le profil doit être public
- Format attendu : `https://www.linkedin.com/in/username`

### Données incomplètes
- Certains champs LinkedIn peuvent être privés
- Vérifier `test-output.json` pour voir ce qui a été récupéré
- Adapter les schemas Zod si nécessaire

## 📊 Monitoring

### Logs à surveiller

```typescript
// Success
'Successfully scraped LinkedIn profile'
'Applied LinkedIn sync for user'

// Errors
'Failed to scrape LinkedIn profile'
'Rate limit exceeded for LinkedIn sync'
'Invalid LinkedIn URL provided'
```

### Métriques

- Nombre de synchronisations par jour
- Taux de succès du scraping
- Durée moyenne du scraping
- Coût Apify mensuel

## 🔐 Sécurité

1. **Token Apify**
   - Ne JAMAIS commit le token
   - Utiliser des variables d'environnement
   - Rotation régulière du token

2. **Rate Limiting**
   - Limite de 24h appliquée en base de données
   - Protection contre les abus

3. **Validation**
   - Tous les DTOs sont validés avec class-validator
   - Les données LinkedIn sont validées avec Zod
   - Les URLs LinkedIn sont validées avant le scraping

## 📚 Ressources

- [Apify Documentation](https://docs.apify.com/)
- [LinkedIn Profile Scraper Actor](https://apify.com/harvestapi/linkedin-profile-scraper)
- [Apify Pricing](https://apify.com/pricing)

## ✅ Checklist de mise en production

- [ ] Token Apify configuré en production
- [ ] Migration Prisma appliquée
- [ ] Logs et monitoring configurés
- [ ] Rate limiting testé
- [ ] Coûts Apify estimés et budgetés
- [ ] Tests E2E passants
- [ ] Documentation utilisateur créée







