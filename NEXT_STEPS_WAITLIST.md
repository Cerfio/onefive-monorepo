# 🚀 Next Steps - Waitlist Implementation

> **Date** : 8 février 2026  
> **Status** : ✅ Implémentation complétée - Prêt pour tests

---

## 📋 **Checklist de Déploiement**

### **Phase 1 : Setup & Migration** ⚙️

- [ ] **1.1** Appliquer la migration Prisma
  ```bash
  cd onefive-back
  npx prisma migrate dev --name add_show_in_leaderboard
  npx prisma generate
  ```

- [ ] **1.2** Vérifier que les badges existent dans la DB
  ```sql
  SELECT * FROM "Badge" WHERE type IN ('EARLY_ADOPTER', 'FOUNDING_MEMBER', 'AMBASSADOR');
  ```
  Si manquants, les créer :
  ```sql
  INSERT INTO "Badge" (id, type, name, description, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid(), 'EARLY_ADOPTER', 'Early Adopter', 'One of the first 500 activated users', NOW(), NOW()),
    (gen_random_uuid(), 'FOUNDING_MEMBER', 'Founding Member', 'Referred 10+ people', NOW(), NOW()),
    (gen_random_uuid(), 'AMBASSADOR', 'Ambassador', 'Official OneFive ambassador', NOW(), NOW());
  ```

- [ ] **1.3** Vérifier que le service email est configuré
  - Variables d'env dans `.env` :
    ```
    ONEFIVE_MICROSERVICE_EMAIL_URL=http://localhost:PORT_EMAIL
    ONEFIVE_MICROSERVICE_EMAIL_API_KEY=your_api_key
    FRONTEND_URL=http://localhost:3001
    ```

---

### **Phase 2 : Tests Backend** 🔧

- [ ] **2.1** Lancer le backend
  ```bash
  cd onefive-back
  npm run dev
  ```

- [ ] **2.2** Tester l'endpoint Ambassador (PUBLIC)
  ```bash
  # Créer d'abord un ambassadeur de test dans la DB
  # Puis tester :
  curl http://localhost:3000/waitlist/ambassador/REFERRAL_CODE_AMBASSADEUR
  
  # Devrait retourner :
  # {
  #   "success": true,
  #   "data": {
  #     "name": "...",
  #     "title": "...",
  #     "bio": "...",
  #     "interviewUrl": "...",
  #     "avatarUrl": "..."
  #   }
  # }
  ```

- [ ] **2.3** Tester l'endpoint Profile (PUBLIC)
  ```bash
  # Créer un profil de test avec referralCode
  # Puis tester :
  curl http://localhost:3000/waitlist/profile/REFERRAL_CODE_USER
  
  # Devrait retourner :
  # {
  #   "success": true,
  #   "data": {
  #     "firstName": "...",
  #     "lastName": "...",
  #     "avatarId": "...",
  #     "bio": "..."
  #   }
  # }
  ```

- [ ] **2.4** Tester l'endpoint Toggle Opt-In (AUTH REQUIRED)
  ```bash
  # Se connecter d'abord pour obtenir un sessionToken
  # Puis tester :
  curl -X PUT http://localhost:3000/waitlist/leaderboard-opt-in \
    -H "Cookie: sessionToken=YOUR_TOKEN"
  
  # Devrait retourner :
  # {
  #   "success": true,
  #   "data": {
  #     "showInLeaderboard": true
  #   }
  # }
  ```

- [ ] **2.5** Vérifier que le leaderboard filtre sur opt-in
  ```bash
  # Se connecter et tester :
  curl http://localhost:3000/waitlist/leaderboard \
    -H "Cookie: sessionToken=YOUR_TOKEN"
  
  # Devrait retourner uniquement les profils avec showInLeaderboard = true
  ```

---

### **Phase 3 : Tests Frontend** 🎨

- [ ] **3.1** Lancer le frontend
  ```bash
  cd onefive-front
  npm run dev
  ```

- [ ] **3.2** Tester la bannière Ambassador
  1. Créer un ambassadeur dans la DB avec `isActive = true`
  2. Visiter `http://localhost:3001/signup?ref=REFERRAL_CODE_AMBASSADEUR`
  3. ✅ Vérifier que la bannière violette s'affiche avec :
     - Photo/nom de l'ambassadeur
     - Badge "Ambassador"
     - Message "Welcome! [Name] is opening the doors..."
     - Lien vers l'interview (si disponible)

- [ ] **3.3** Tester la bannière User Normal
  1. Créer un profil utilisateur normal avec `referralCode`
  2. Visiter `http://localhost:3001/signup?ref=REFERRAL_CODE_USER`
  3. ✅ Vérifier que la bannière bleue s'affiche avec :
     - Prénom + Nom
     - Badge "Priority access"

- [ ] **3.4** Tester l'input code manuel
  1. Visiter `http://localhost:3001/signup` (sans `?ref=`)
  2. Cliquer sur "J'ai un code de parrainage"
  3. Entrer un code valide
  4. ✅ Vérifier que la bannière correspondante s'affiche

- [ ] **3.5** Tester le toggle opt-in leaderboard
  1. Se connecter avec un compte
  2. Visiter `http://localhost:3001/waitlist`
  3. Scroller jusqu'au leaderboard
  4. Toggle le switch "Appear in the public leaderboard"
  5. ✅ Vérifier :
     - Toast de succès
     - Switch change d'état
     - Le profil apparaît/disparaît du leaderboard après refresh

---

### **Phase 4 : Tests End-to-End** 🔄

- [ ] **4.1** Test du flow complet "Ambassadeur → Accès Immédiat"
  1. Créer un ambassadeur avec `isActive = true`
  2. Visiter `/signup?ref=CODE_AMBASSADEUR`
  3. Créer un compte
  4. ✅ Vérifier que le profil est créé avec :
     - `waitlistStatus = 'ACTIVE'`
     - `referrerType = 'AMBASSADOR'`
     - `activatedAt` est défini

- [ ] **4.2** Test du flow "User Normal → Waitlist"
  1. Créer un profil utilisateur avec `referralCode`
  2. Visiter `/signup?ref=CODE_USER`
  3. Créer un compte
  4. ✅ Vérifier que le profil est créé avec :
     - `waitlistStatus = 'WAITING'`
     - `referrerType = 'USER'`
     - `referredByCode` est défini

- [ ] **4.3** Test du badge "Early Adopter"
  1. Activer manuellement un profil (via service ou admin)
  2. ✅ Vérifier que si `count(ACTIVE) <= 500`, le badge `EARLY_ADOPTER` est attribué

- [ ] **4.4** Test du badge "Founding Member"
  1. Créer un profil avec 9 parrainages acceptés
  2. Créer un 10ème parrainage accepté
  3. ✅ Vérifier que :
     - Le badge `FOUNDING_MEMBER` est attribué
     - Le profil passe à `ACTIVE` (si était `WAITING`)
     - L'email "Founding Member Unlocked" est envoyé

- [ ] **4.5** Test de l'email "Compte Activé"
  1. Créer un profil en `WAITING`
  2. Appeler `waitlistService.activateProfile(profileId)`
  3. ✅ Vérifier que l'email "Compte Activé" est envoyé

---

### **Phase 5 : Tests de Performance** ⚡

- [ ] **5.1** Tester le calcul dynamique de position
  - Créer 1000+ profils en `WAITING`
  - Vérifier que `GET /waitlist/status` répond rapidement (< 500ms)

- [ ] **5.2** Tester le leaderboard avec beaucoup de données
  - Créer 100+ profils avec parrainages
  - Vérifier que `GET /waitlist/leaderboard` répond rapidement (< 500ms)

---

### **Phase 6 : Préparation Production** 🚀

- [ ] **6.1** Vérifier les variables d'environnement
  ```
  # Backend
  FRONTEND_URL=https://onefive.app
  ONEFIVE_MICROSERVICE_EMAIL_URL=https://email.onefive.app
  ONEFIVE_MICROSERVICE_EMAIL_API_KEY=prod_key
  
  # Frontend
  NEXT_PUBLIC_API_URL=https://api.onefive.app
  ```

- [ ] **6.2** Créer les badges en production
  ```sql
  -- Exécuter la même requête que Phase 1.2 en production
  ```

- [ ] **6.3** Tester les emails en production
  - Vérifier que les templates s'affichent correctement
  - Tester l'envoi réel d'un email

- [ ] **6.4** Documenter les endpoints admin (pour future dashboard)
  - `PUT /waitlist/activate/:profileId` (à créer si besoin)
  - `POST /waitlist/bulk-activate` (à créer si besoin)

---

## 🐛 **Debug Checklist**

Si quelque chose ne fonctionne pas :

### **Bannière ne s'affiche pas**
- [ ] Vérifier que le code referral existe dans la DB
- [ ] Vérifier les logs backend (erreur 404 ?)
- [ ] Vérifier la console frontend (erreur réseau ?)
- [ ] Vérifier que les endpoints sont bien `@Public()`

### **Toggle opt-in ne fonctionne pas**
- [ ] Vérifier que l'utilisateur est connecté
- [ ] Vérifier les logs backend
- [ ] Vérifier que `showInLeaderboard` est bien retourné dans `getWaitlistStatus`

### **Emails ne sont pas envoyés**
- [ ] Vérifier que le service email est démarré
- [ ] Vérifier les variables d'environnement
- [ ] Vérifier les logs backend (erreur d'envoi ?)
- [ ] Vérifier que les templates existent dans `onefive-email`

### **Badge Early Adopter non attribué**
- [ ] Vérifier que le badge existe dans la DB
- [ ] Vérifier que `count(ACTIVE) <= 500` au moment de l'activation
- [ ] Vérifier les logs backend

---

## 📝 **Notes Importantes**

1. **Migration Prisma** : La migration ajoute uniquement `showInLeaderboard` dans Profile. Pas de breaking changes.

2. **Emails** : Les templates existent déjà dans `onefive-email/transactional/emails/`. L'intégration est faite dans `waitlist.service.ts`.

3. **Leaderboard** : Le calcul de position est **dynamique** (pas stocké en DB). C'est normal que ça prenne quelques ms avec beaucoup de données.

4. **Opt-in Leaderboard** : Par défaut, `showInLeaderboard = false`. Les users doivent explicitement opt-in.

5. **Validation Parrainage** : Un parrainage compte quand le profil filleul est complet (onboarding terminé = email + phoneNumber vérifiés).

---

## ✅ **Validation Finale**

Une fois tous les tests passés :

- [ ] ✅ Migration appliquée
- [ ] ✅ Backend fonctionne (endpoints testés)
- [ ] ✅ Frontend fonctionne (UI testée)
- [ ] ✅ Emails envoyés correctement
- [ ] ✅ Badges attribués automatiquement
- [ ] ✅ Leaderboard filtre sur opt-in
- [ ] ✅ Bannières s'affichent correctement

**🎉 Prêt pour la production !**

---

**Dernière Mise à Jour** : 8 février 2026
