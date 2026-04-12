# Système de Réinitialisation de Mot de Passe

Ce dossier contient toutes les pages et fonctionnalités liées à la réinitialisation de mot de passe.

## Structure des Pages

### 1. `/auth/reset-password` - Page principale
- **Fichier**: `page.tsx`
- **Fonction**: Permet à l'utilisateur de saisir son email pour recevoir un lien de réinitialisation
- **Fonctionnalités**:
  - Formulaire de saisie d'email
  - Validation en temps réel
  - Gestion des erreurs
  - Page de confirmation après envoi

### 2. `/auth/reset-password/verify` - Vérification du code OTP
- **Fichier**: `verify/page.tsx`
- **Fonction**: Permet de saisir le code OTP reçu par email
- **Fonctionnalités**:
  - Interface de saisie de code à 4 chiffres
  - Navigation automatique entre les champs
  - Validation du code
  - Gestion des erreurs (code incorrect, expiré)

### 3. `/auth/reset-password/new-password` - Nouveau mot de passe
- **Fichier**: `new-password/page.tsx`
- **Fonction**: Permet de saisir le nouveau mot de passe
- **Fonctionnalités**:
  - Saisie du nouveau mot de passe
  - Confirmation du mot de passe
  - Indicateur de force du mot de passe
  - Validation en temps réel
  - Boutons pour afficher/masquer les mots de passe

### 4. `/auth/reset-password/verify-link` - Gestion des liens email
- **Fichier**: `verify-link/page.tsx`
- **Fonction**: Page de redirection pour les liens reçus par email
- **Fonctionnalités**:
  - Récupération du token depuis l'URL
  - Redirection vers la page de vérification appropriée

## API Endpoints

### 1. Demande de réinitialisation
```typescript
POST /auth/password/reset/request
Body: { email: string }
```

### 2. Vérification du code
```typescript
POST /auth/password/reset/verify
Body: { code: string, token: string }
```

### 3. Réinitialisation du mot de passe
```typescript
POST /auth/password/reset
Body: { password: string, confirmPassword: string }
Headers: { credentials: 'include' }
```

## Flux Utilisateur

1. **Demande de réinitialisation**
   - L'utilisateur saisit son email sur `/auth/reset-password`
   - Un email est envoyé avec un lien contenant un token

2. **Vérification du code**
   - L'utilisateur clique sur le lien dans l'email
   - Il est redirigé vers `/auth/reset-password/verify-link`
   - Puis vers `/auth/reset-password/verify` avec le token
   - Il saisit le code OTP reçu par email

3. **Nouveau mot de passe**
   - Après vérification du code, l'utilisateur est redirigé vers `/auth/reset-password/new-password`
   - Il saisit son nouveau mot de passe
   - Le mot de passe est mis à jour et l'utilisateur est redirigé vers la page de connexion

## Gestion des Erreurs

### Erreurs courantes :
- `AuthenticationEmailNotFoundBadRequestException`: Email non trouvé
- `AuthenticationPasswordResetBadCodeBadRequestException`: Code incorrect
- `AuthenticationPasswordResetCodeExpiredBadRequestException`: Code expiré
- `AuthenticationPasswordResetTokenExpiredBadRequestException`: Token expiré
- `AuthenticationPasswordResetInvalidTokenBadRequestException`: Token invalide
- `AuthenticationPasswordResetPasswordsDoNotMatchBadRequestException`: Mots de passe différents

## Sécurité

- Tous les tokens sont temporaires et expirent automatiquement
- Les codes OTP sont à usage unique
- Validation côté client et serveur
- Messages d'erreur génériques pour éviter l'énumération d'emails

## Styles et UX

- Design cohérent avec le reste de l'application
- Animations avec Framer Motion
- Indicateur de force du mot de passe
- Messages d'erreur clairs et informatifs
- Navigation intuitive avec boutons de retour 