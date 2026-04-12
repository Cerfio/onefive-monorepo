# 📊 Analyse de Couverture Tests E2E & Impacts Frontend
## Tâches 1-21 Corrigées

**Date d'analyse** : 10 février 2026  
**Tâches analysées** : 21 tâches (19 critiques PHASE 0 + 2 importantes PHASE 1)

---

## 🧪 TESTS E2E PRIORITAIRES

### ✅ DÉJÀ FAIT

#### #21 - Brute-Force Protection Password Reset
- **Statut** : ✅ **Tests E2E complets** (`test/password-reset-brute-force.e2e-spec.ts`)
- **Coverage** : 13 tests
  - Simulation d'attaque complète (5 tentatives)
  - Blocage après 5 tentatives
  - Reset du compteur
  - Tests concurrents
  - Analyse sécurité mathématique

---

### 🔥 CRITIQUE - À AJOUTER EN PRIORITÉ

#### #1 - IDOR Data Room
- **Pourquoi E2E** : Vérifier que guards empêchent réellement accès non autorisé
- **Tests recommandés** :
  ```typescript
  describe('Data Room Security (E2E)', () => {
    it('should block access to dataroom without membership');
    it('should block file download without proper permissions');
    it('should block deletion without owner role');
    it('should allow access with proper membership');
    it('should respect group permissions (hasAllAccess vs category permissions)');
  });
  ```
- **Effort** : 1-2 heures
- **Impact** : 🔥 **CRITIQUE** - Sécurité des documents sensibles

#### #2 - Signed URL Permissions
- **Pourquoi E2E** : Vérifier que permissions sont vérifiées avant génération URL
- **Tests recommandés** :
  ```typescript
  describe('Signed URL Security (E2E)', () => {
    it('should generate signed URL for user with view permission');
    it('should block signed URL for user without permissions');
    it('should differentiate canView vs canDownload');
    it('should log access attempts in audit trail');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🔥 **CRITIQUE** - Téléchargement documents sensibles

#### #3 - File Upload Validation
- **Pourquoi E2E** : Vérifier validation fichiers réelle (MIME, extension, size)
- **Tests recommandés** :
  ```typescript
  describe('File Upload Security (E2E)', () => {
    it('should accept valid PDF file');
    it('should reject .exe file (dangerous extension)');
    it('should reject .html file (XSS risk)');
    it('should reject file > 50MB');
    it('should sanitize filename with path traversal attempt');
    it('should accept up to 20 files, reject 21st');
    it('should reject mismatched MIME type (fake extension)');
  });
  ```
- **Effort** : 2 heures
- **Impact** : 🔥 **CRITIQUE** - Prévention XSS/malware

#### #6 - Auth Cookies (httpOnly)
- **Pourquoi E2E** : Vérifier que cookies sont réellement httpOnly
- **Tests recommandés** :
  ```typescript
  describe('Auth Cookie Security (E2E)', () => {
    it('should set httpOnly cookie on signin');
    it('should set secure flag in production');
    it('should set sameSite=lax');
    it('should set both token (httpOnly) and is_authenticated (non-httpOnly)');
    it('should clear both cookies on signout');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🔥 **CRITIQUE** - Prévention vol session

#### #7 - XSS Protection (Sanitization)
- **Pourquoi E2E** : Vérifier que contenu dangereux est réellement nettoyé
- **Tests recommandés** :
  ```typescript
  describe('XSS Protection (E2E)', () => {
    it('should sanitize <script> tag in post content');
    it('should sanitize <img> with onerror in bio');
    it('should allow safe HTML tags (b, i, a) in rich text');
    it('should strip javascript: protocol in links');
    it('should sanitize array of tags');
    it('should persist sanitized content in database');
  });
  ```
- **Effort** : 1-2 heures
- **Impact** : 🔥 **CRITIQUE** - Prévention Stored XSS

#### #8 - Waitlist Guard Global
- **Tests unitaires** : ✅ Déjà présents (`waitlist.guard.spec.ts`)
- **Tests E2E recommandés** :
  ```typescript
  describe('Waitlist Guard (E2E)', () => {
    it('should allow ACTIVE user to create post');
    it('should block WAITING user from creating post (403)');
    it('should block WAITING user from creating discussion');
    it('should allow WAITING user to update profile (exempt)');
    it('should allow WAITING user to access auth endpoints (exempt)');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🔥 **CRITIQUE** - Contrôle d'accès waitlist

#### #17 - Password Reset Race Condition
- **Pourquoi E2E** : Vérifier que transaction empêche codes différents
- **Tests recommandés** :
  ```typescript
  describe('Password Reset Race Condition (E2E)', () => {
    it('should generate same code for concurrent requests (60s cooldown)');
    it('should block second request within 60 seconds (429)');
    it('should send email with consistent code');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🔥 **CRITIQUE** - Cohérence email/DB

#### #18 - Referral Email Verification
- **Pourquoi E2E** : Vérifier flux complet signup → email → activation
- **Tests recommandés** :
  ```typescript
  describe('Referral Email Verification (E2E)', () => {
    it('should create referral with PENDING status on signup');
    it('should NOT activate profile if email not verified');
    it('should NOT count toward founding member if email not verified');
    it('should accept referral after email verification');
    it('should activate profile if referrer is ambassador');
    it('should count toward founding member after verification');
  });
  ```
- **Effort** : 2 heures
- **Impact** : 🔥 **CRITIQUE** - Intégrité système referral

#### #19 - Equity Race Condition
- **Tests unitaires** : ✅ Déjà présents (`create-invitation.handler.spec.ts`)
- **Tests E2E recommandés** :
  ```typescript
  describe('Startup Equity Race Condition (E2E)', () => {
    it('should allow invitation with 40% equity (60% available)');
    it('should block concurrent invitations that exceed 100%');
    it('should count pending invitations in equity calculation');
    it('should free up equity when invitation expires');
  });
  ```
- **Effort** : 2 heures
- **Impact** : 🔥 **CRITIQUE** - Intégrité cap table

---

### 🟡 MOYEN - RECOMMANDÉ

#### #12 - Analytics Performance
- **Tests de performance recommandés** :
  ```typescript
  describe('Analytics Performance (E2E)', () => {
    it('should load dashboard in < 2 seconds (was 15-30s)', {
      timeout: 3000
    });
    it('should batch fetch views (no N+1)');
    it('should use Promise.all for parallel queries');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🟡 **MOYEN** - Expérience utilisateur

#### #13 - Post Feed Performance
- **Tests de performance recommandés** :
  ```typescript
  describe('Post Feed Performance (E2E)', () => {
    it('should load feed with 50 posts in < 1 second');
    it('should batch fetch follow statuses (no N+1)');
    it('should batch fetch streaks (no N+1)');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🟡 **MOYEN** - Performance feed

#### #20 - checkFoundingMember Race Condition
- **Tests E2E recommandés** :
  ```typescript
  describe('Founding Member Race Condition (E2E)', () => {
    it('should send only ONE founding member email');
    it('should activate profile only once with concurrent calls');
    it('should award badge only once');
  });
  ```
- **Effort** : 1 heure
- **Impact** : 🟡 **MOYEN** - Évite emails dupliqués

---

### ⚪ OPTIONNEL

#### #4, #5, #9, #10, #11 - Error Handling & Data Leaks
- **Pourquoi optionnel** : Tests unitaires suffisants pour ce type de logique
- **Si tests E2E** : Vérifier codes HTTP corrects (400, 404, 403 vs 500)
- **Effort** : 30 min chacun
- **Impact** : ⚪ Pas critique, unitaires suffisants

#### #14, #15, #16 - Performance & DTOs
- **Pourquoi optionnel** : Tests unitaires + monitoring suffisants
- **Effort** : 1 heure chacun
- **Impact** : ⚪ Monitoring en production plus pertinent

---

## 📱 IMPACTS FRONTEND

### ✅ AUCUN CHANGEMENT NÉCESSAIRE (Backend-Only)

Ces tâches n'affectent QUE le backend :
- ✅ #1 - IDOR (guards backend)
- ✅ #2 - Signed URL (permissions backend)
- ✅ #4 - Data leak sessions (select backend)
- ✅ #5 - Password hash (select backend)
- ✅ #9, #10, #11 - Exceptions (codes HTTP uniquement)
- ✅ #12, #13, #14 - Performance (optimisations backend)
- ✅ #15 - Index DB (migration backend)
- ✅ #16 - DTOs validation (backend)
- ✅ #17, #19, #20 - Race conditions (transactions backend)

### 🟡 VÉRIFICATIONS FRONTEND RECOMMANDÉES

#### #3 - File Upload Validation
**Impact Frontend** : 🟡 Vérifier gestion des erreurs
```typescript
// Frontend devrait gérer ces nouveaux cas d'erreur :
- 400: "File type not allowed" (MIME/extension rejetée)
- 400: "File too large (max 50MB)"
- 400: "Too many files (max 20)"
- 400: "Filename too long (max 255 chars)"
```
**Action** : Ajouter messages d'erreur clairs pour l'utilisateur

#### #6 - Auth Cookies (httpOnly)
**Impact Frontend** : ✅ **DÉJÀ COMPATIBLE**
- Frontend utilise déjà le cookie `is_authenticated` (non-httpOnly) pour UX
- Le cookie `token` (httpOnly) est automatiquement envoyé par le navigateur
- Pas de `localStorage.setItem('token', ...)` dans le frontend

**Vérification recommandée** :
```typescript
// Vérifier que le frontend N'accède PAS directement au token
// ❌ BAD: localStorage.getItem('token')
// ✅ GOOD: Check cookie 'is_authenticated' pour UI state
```

#### #7 - XSS Protection (Sanitization)
**Impact Frontend** : 🟡 Vérifier affichage
```typescript
// Le contenu est sanitisé BACKEND, mais le frontend doit :
1. Utiliser dangerouslySetInnerHTML avec précaution
2. Préférer affichage texte brut si possible
3. Ne PAS re-sanitiser (déjà fait backend)

// Example React :
<div dangerouslySetInnerHTML={{ __html: post.content }} />
// OU mieux :
<div>{sanitizedPost.content}</div> // Si contenu est texte pur
```
**Action** : Review des composants qui affichent contenu utilisateur

#### #8 - Waitlist Guard
**Impact Frontend** : 🔥 **IMPORTANT - VÉRIFIER UX**
```typescript
// Le frontend DOIT gérer HTTP 403 pour utilisateurs WAITING
// Exemple : User WAITING tente de créer un post

// ❌ BAD: Laisser le bouton "Créer post" visible
// ✅ GOOD: Désactiver + message "Vous êtes sur liste d'attente"

if (user.waitlistStatus !== 'ACTIVE') {
  return <WaitlistBanner message="Activez votre compte pour publier" />;
}
```
**Action** : 
1. Ajouter vérification `waitlistStatus` dans UI
2. Désactiver boutons pour users WAITING
3. Afficher messages clairs
4. Gérer 403 gracieusement (pas de toast d'erreur brutal)

#### #18 - Referral Email Verification
**Impact Frontend** : 🟡 Vérifier flow onboarding
```typescript
// Après signup avec referral code :
- User reçoit status WAITING (pas ACTIVE)
- Frontend doit afficher message "Vérifiez votre email"
- Après vérification email → acceptPendingReferral backend
- Frontend doit refresh user status

// Flow :
1. Signup → waitlistStatus = WAITING
2. Email verification → acceptPendingReferral()
3. Si referrer = ambassador → waitlistStatus = ACTIVE
4. Frontend refresh user → Show welcome message
```
**Action** : Vérifier que le flow d'onboarding gère bien le status PENDING → ACTIVE

#### #21 - Brute-Force Protection
**Impact Frontend** : 🟡 Gestion erreur 429
```typescript
// Après 5 tentatives échouées de code reset :
- Backend retourne 429 (Too Many Requests)
- Message : "Too many attempts. Please request a new reset code."

// Frontend doit :
1. Catcher 429 spécifiquement
2. Afficher message clair
3. Désactiver input + submit
4. Afficher bouton "Request New Code"
```
**Action** : Ajouter gestion spécifique du 429 sur page reset password

---

## 📊 RÉSUMÉ PRIORISATION

### 🔥 Tests E2E À FAIRE EN PRIORITÉ (8 tests)
1. **#1 - IDOR Data Room** (1-2h)
2. **#2 - Signed URL** (1h)
3. **#3 - File Upload** (2h)
4. **#6 - Auth Cookies** (1h)
5. **#7 - XSS Protection** (1-2h)
6. **#8 - Waitlist Guard** (1h)
7. **#18 - Referral Email** (2h)
8. **#19 - Equity Race** (2h)

**Total effort** : **11-15 heures** (~2 jours)

### 🟡 Tests E2E Recommandés (4 tests)
9. **#12 - Analytics** (1h)
10. **#13 - Post Feed** (1h)
11. **#17 - Password Reset Race** (1h)
12. **#20 - Founding Member Race** (1h)

**Total effort** : **4 heures** (~0.5 jour)

### 📱 Frontend - Actions Requises (4 vérifications)
1. **#3 - File Upload** : Messages d'erreur (30 min)
2. **#7 - XSS** : Review affichage contenu (1h)
3. **#8 - Waitlist** : UX pour users WAITING (2h)
4. **#18 - Referral** : Flow onboarding (1h)
5. **#21 - Brute-force** : Gestion 429 (30 min)

**Total effort** : **5 heures** (~0.75 jour)

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase A : Tests E2E Critiques (2 jours)
- Créer les 8 tests prioritaires
- Focus : Sécurité (IDOR, XSS, Auth, Upload)

### Phase B : Frontend (0.75 jour)
- Vérifications UX pour Waitlist, File Upload, Referral
- Gestion erreurs 429, 403

### Phase C : Tests E2E Secondaires (0.5 jour)
- Tests performance et race conditions

### Phase D : Tests E2E Runner CI/CD
- Intégrer dans pipeline GitHub Actions
- Configurer base de données de test
- Seuil de coverage minimum

---

**TOTAL EFFORT** : **~3-4 jours** (tests + frontend)

**BÉNÉFICES** :
- ✅ Confiance à 100% dans la sécurité
- ✅ Détection précoce des régressions
- ✅ Documentation vivante du comportement
- ✅ Validation des guards et permissions
- ✅ UX cohérente pour utilisateurs
