# LinkedIn Onboarding Feature

## 📝 Description

Cette fonctionnalité permet aux utilisateurs de créer leur profil Onefive directement via LinkedIn lors de l'onboarding, en important automatiquement :
- Informations de base (prénom, nom, photo de profil)
- Expériences professionnelles
- Formations/Éducations
- Compétences
- Headline (titre professionnel)
- Localisation

## 🎯 Flux utilisateur

1. L'utilisateur arrive sur `/onboarding`
2. Dans `StepProfile`, il voit un bouton "Créer mon profil avec LinkedIn"
3. Clic sur le bouton → OAuth LinkedIn
4. Redirection vers `/auth/oauth2/callback?onboarding=true`
5. Backend récupère les données LinkedIn via scraping (Apify)
6. Affichage d'un écran de confirmation avec sélection des expériences/éducations
7. L'utilisateur valide → les données sont pré-remplies
8. L'utilisateur continue l'onboarding (rôles, tags, téléphone)
9. À la fin, le profil est créé avec toutes les données LinkedIn

## 🏗️ Architecture

### Backend

#### Nouveau Handler
- `onefive-back/src/linkedin-sync/handlers/onboarding-linkedin-sync.handler.ts`
  - Récupère les données LinkedIn via OAuth + scraping
  - Retourne les données formatées pour l'onboarding

#### Endpoint
- `POST /linkedin-sync/onboarding`
  - Body: `{ code: string }` (code OAuth)
  - Response: `{ profile, experiences, educations, skills }`

### Frontend

#### Nouveaux composants
- `onefive-front/src/features/auth/Onboarding/LinkedInConfirmation/index.tsx`
  - Affiche les données LinkedIn récupérées
  - Permet de sélectionner les expériences/éducations à importer
  - Affichage des compétences (info seulement)

#### Modifications
- `OnboardingContext.tsx` : Ajout des états pour les données LinkedIn
- `StepProfile/index.tsx` : Ajout du bouton "Créer avec LinkedIn"
- `Onboarding/index.tsx` : Intégration du flux de confirmation
- `auth/oauth2/callback/client.tsx` : Détection du paramètre `onboarding=true`

## 📊 Données importées

### Profile
```typescript
{
  firstName: string;
  lastName: string;
  headline?: string;
  location?: string;
  profilePictureUrl?: string;
}
```

### Experiences
```typescript
{
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
}
```

### Educations
```typescript
{
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}
```

### Skills
```typescript
string[] // Liste de compétences (affichage uniquement)
```

## 🔧 Configuration

### Variables d'environnement (Frontend)
```env
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Redirect URI LinkedIn
Ajouter dans la console LinkedIn Developer :
```
http://localhost:3002/auth/oauth2/callback?onboarding=true
```

## 🚀 Usage

### Pour l'utilisateur
1. Cliquer sur "Créer mon profil avec LinkedIn"
2. S'authentifier sur LinkedIn
3. Sélectionner les expériences/formations à importer
4. Valider et continuer l'onboarding

### Pour le développeur
```typescript
// Récupérer les données dans le contexte
const {
  linkedInData,
  selectedExperiences,
  selectedEducations
} = useOnboardingContext();

// Les données sont automatiquement utilisées lors de la création du profil
```

## 📝 Notes importantes

1. **Headline** : Le headline LinkedIn est importé mais pas affiché dans l'onboarding (simplifié). Il sera stocké côté backend si disponible.

2. **Localisation** : La localisation LinkedIn est importée mais nécessite un parsing pour extraire pays/ville. Actuellement laissé à l'utilisateur de compléter manuellement.

3. **Rate limiting** : Le scraping LinkedIn est soumis aux mêmes limites que la sync normale (vérifier les quotas Apify).

4. **Avatar** : La photo de profil LinkedIn est téléchargée et convertie en File pour upload.

5. **Batch updates** : Les expériences et éducations sont créées en batch après la création du profil pour optimiser les performances.

## 🧪 Tests

### Tester le flux complet
1. Démarrer le backend : `cd onefive-back && npm run start:dev`
2. Démarrer le frontend : `cd onefive-front && npm run dev`
3. Naviguer vers `http://localhost:3002/onboarding`
4. Cliquer sur "Créer mon profil avec LinkedIn"
5. Vérifier que les données sont bien importées

### Cas de test
- ✅ Utilisateur avec LinkedIn complet (xp + édu)
- ✅ Utilisateur avec LinkedIn partiel (seulement xp ou seulement édu)
- ✅ Utilisateur sans LinkedIn URL (vanityName manquant)
- ✅ Erreur lors du scraping (fallback sur données OAuth)
- ✅ Annulation de la confirmation
- ✅ Déselection de certaines xp/édu

## 🔒 Sécurité

- ✅ Authentification OAuth LinkedIn
- ✅ Rate limiting sur le scraping
- ✅ Validation des données côté backend
- ✅ Protection contre les injections (données sanitizées)
- ✅ Gestion des erreurs sans exposer les détails techniques

## 📚 Ressources

- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Apify LinkedIn Scraper](https://apify.com/apify/linkedin-profile-scraper)
- Architecture monolithique : voir `onefive-back/.cursorrules`






