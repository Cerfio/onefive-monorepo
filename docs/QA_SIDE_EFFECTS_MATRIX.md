# QA — Matrice Action → Effets de bord

Pour chaque action user, la liste des effets déclenchés côté serveur. À utiliser comme checklist pendant la QA : tu déclenches l'action avec 2 comptes (A = acteur, B = destinataire) et tu vérifies chaque effet.

## Légende
- 🔔 Notification in-app (bell) — visible dans `/notifications` côté destinataire
- 📧 Email — vérifier réception (Resend dashboard ou boîte mail)
- ⚡ WebSocket emit — vérifier dans DevTools → Network → WS frames
- 📊 PostHog event — vérifier dans PostHog dashboard
- 🔗 Discord webhook — vérifier dans le Discord ops channel
- 💾 Effet DB — counter, cascade, soft-delete, flag update
- 🚫 Pas de self-notif — l'acteur ne reçoit jamais la notif de sa propre action

---

## 1. Feed & Posts

### 1.1 A crée un post
- 💾 `Post` créé avec `profileId=A`
- 💾 `Streak` de A mis à jour (si premier post du jour)
- 📊 `post_created` { post_id, type, hasAttachments }
- 🚫 Aucune notif (contenu propre)
- **Pas fait** : push notifs aux followers de A (le feed est pull-based)

### 1.2 A like un post de B (`POST /post-reaction`)
- 💾 `PostReaction` créé (unique par user+post)
- 🔔 **LIKE** à B — "A a aimé votre publication" 🚫 si A=B
- 📊 `post_reaction_created` { post_id, type }

### 1.3 A retire son like
- 💾 `PostReaction` supprimé
- ❌ Pas de notif (unreact silencieux)
- La notif précédente reste dans l'inbox de B (pas retirée)

### 1.4 A commente un post de B
- 💾 `PostComment` créé (top-level, pas de parentId)
- 🔔 **COMMENT** à B — "A a commenté votre publication" 🚫 si A=B
- 📊 `post_comment_created`

### 1.5 A répond au commentaire de B (thread de 2e niveau)
- 💾 `PostComment` créé avec `parentId`
- 🔔 **COMMENT** au propriétaire du post (si ≠ B et ≠ A)
- 🔔 **COMMENT_REPLY** à B (auteur du parent) — "A a répondu à votre commentaire"
- 🔔 **COMMENT_REPLY** à TOUS les autres profils qui ont aussi répondu au même parent (sauf A et B) — "A a aussi répondu au commentaire"
- 📊 `post_comment_created`
- ⚠️ **À vérifier en QA** : le fan-out aux co-répondeurs n'est pas doublonné

### 1.6 A réagit au commentaire de B
- 💾 `PostCommentReaction` créé
- 🔔 **LIKE** à B — "A a réagi à votre commentaire" (ou "à votre réponse" si le comment a un parentId)

### 1.7 A reposte un post de B (`POST /posts/:id/repost`)
- 💾 `Post` (repost) créé avec `originalPostId=B_post_id`
- 🔔 **SHARE** à B — "A a reposté votre publication" (ou "avec un commentaire" si content)
- 📊 `post_reposted`

### 1.8 A voit un post de B
- 💾 `PostView` créé (dédupliqué par session/fenêtre)
- ❌ Pas de notif

### 1.9 A bookmark un post
- 💾 `PostBookmark` créé
- ❌ Pas de notif

### 1.10 A supprime son post
- 💾 `Post.isDeleted=true` (soft-delete probablement)
- 💾 Cascade : reactions, commentaires, bookmarks orphelins (à vérifier)
- 📊 `post_deleted`
- ⚠️ **À vérifier en QA** : les reposts avec commentaire deviennent-ils "orphelins" ? Que voit B si le post reposté par A disparaît ?

---

## 2. Discussions

### 2.1 A crée une discussion
- 💾 `Discussion` créée, `Poll` + `PollOption` si applicable
- 📊 `discussion_created`
- ❌ Pas de notif (aucun destinataire évident)

### 2.2 A vote sur un poll de discussion de B
- 💾 `DiscussionPollVote` créé (ou updated si changement de vote)
- ❌ Pas de notif (choix produit — le poll tracker agrège)

### 2.3 A poste une answer à la discussion de B
- 💾 `DiscussionAnswer` créé
- 🔔 **Probable** (à vérifier — pas de `notifyDiscussionAnswer` trouvé dans le helper) — à confirmer en QA ou ajouter

### 2.4 A upvote une answer de B
- 💾 `DiscussionAnswerUpvote` créé
- 🔔 **À vérifier** — pas de helper dédié, possiblement via réaction

### 2.5 A répond à une answer (reply)
- 💾 `DiscussionAnswerReply` créé
- 🔔 **À vérifier** — même question

### 2.6 A réagit à une answer / reply
- 💾 `DiscussionAnswerReaction` / `DiscussionAnswerReplyReaction`
- 🔔 **À vérifier**

⚠️ **Gap probable** : le module Discussion ne semble pas brancher `NotificationHelperService` (grep = 0 hit sauf via handlers). Vérifier en QA si les auteurs reçoivent les notifs. Si non → à implémenter avant launch.

---

## 3. Network & Connexions

### 3.1 A suit B (follow one-way)
- 💾 `ProfileFollow` créé
- 🔔 **FOLLOW** à B avec **agrégation 24h** (LinkedIn-style) :
  - Si B n'a pas de notif FOLLOW non lue des 24h → nouvelle notif "A a commencé à vous suivre"
  - Sinon → la notif existante est updatée : "A et 2 autres personnes vous suivent"
  - 🚫 Si A=B
- 📊 `profile_followed`

### 3.2 A unfollow B
- 💾 `ProfileFollow` supprimé
- 📊 `profile_unfollowed`
- ❌ Pas de notif
- ⚠️ Le count de followers de B décrémente (à vérifier en UI)

### 3.3 A envoie demande de connexion à B
- 💾 `Relationship` créé `status=PENDING`, `requesterId=A`, `accepterId=B`
- 🔔 **CONNECTION_REQUEST** à B
- 📊 `connection_request_sent`

### 3.4 B accepte la demande de A
- 💾 `Relationship.status=ACCEPTED`, `acceptedAt=now()`
- 💾 `ProfileConnection` créé (bidirectionnel)
- 🔔 À A — "B a accepté votre demande" (à vérifier — helper spécifique)
- 📊 `connection_request_accepted`

### 3.5 B rejette la demande
- 💾 `Relationship.status=REJECTED`
- 📊 `connection_request_rejected`
- ❌ Pas de notif à A (discrétion)

### 3.6 A supprime une connexion avec B
- 💾 `Relationship` + `ProfileConnection` supprimés
- 📊 `connection_deleted`
- ❌ Pas de notif à B

### 3.7 A visite le profil de B
- 🔔 **PROFILE_VIEW** à B (throttlé — à vérifier la fenêtre de dedup)
- ⚠️ **À vérifier** : opt-out dans `UserSettings` (B peut désactiver "who viewed my profile")

---

## 4. Messaging (WebSocket-heavy)

### 4.1 A crée une conversation avec B
- 💾 `Conversation` + `ConversationMember` (A, B) créés
- 📊 `conversation_created`
- ⚡ ? (à vérifier — B doit recevoir un event `conversation:new` pour rafraîchir sa liste)

### 4.2 A envoie un message
- 💾 `Message` créé, `status=SENT`
- ⚡ `message:new` diffusé à tous les participants sauf A (via room Socket.io)
- 📊 `message_sent`
- 💾 Unread count pour chaque participant ≠ A augmente (calculé lazy)

### 4.3 A édite un message
- 💾 `Message.content` updated, `editedAt` set
- ⚡ `message:edited` à tous les participants
- ❌ Pas de PostHog spécifique

### 4.4 A supprime un message
- 💾 `Message.isDeleted=true`
- ⚡ `message:deleted` avec messageId
- ⚠️ Les replies à ce message restent — UI doit afficher "Message supprimé"

### 4.5 B marque la conversation comme lue
- 💾 `MessageRead` créé pour chaque message non-lu de B dans la conv
- ⚡ `message:read` à A avec `{ conversationId, messageId, readBy: profileId, readAt }`
- 💾 Unread count de B passe à 0

### 4.6 A réagit à un message
- 💾 `MessageReaction` créé
- ⚡ `reaction:added` à tous les participants de la conv
- 📊 `message_reaction_created`

### 4.7 A commence à taper
- ⚡ `typing:start` à tous les autres participants (rate-limité 10/5s)
- ❌ Aucun effet DB

### 4.8 A se connecte/déconnecte (WebSocket)
- ⚡ `presence:update` à **toutes les connexions de A en statut ACCEPTED qui sont elles-mêmes online**
- 💾 Aucun effet DB (présence en mémoire)

---

## 5. Startup

### 5.1 A crée une startup
- 💾 `Startup` + `StartupMember` (A, SUPER_ADMIN, equity par défaut) créés
- 📊 `startup_created`
- 📧 **Si invitation à d'autres founders via email** → email envoyé à chaque nouvel invité
- 🔔 **STARTUP_INVITATION** pour chaque invité existant (profileId connu)

### 5.2 A ajoute un founder existant (profileId)
- 💾 `StartupMember` créé (isFounder=true), equity validée (total ≤ 100%)
- 💾 `Relationship` (connexion) créé A↔B
- 🔔 **STARTUP_UPDATE** à B (à vérifier le type exact)
- 📊 `startup_founder_added`

### 5.3 A ajoute un founder par email (new user)
- 💾 `StartupInvitation` créé, expire dans 7 jours
- 📧 Email envoyé à l'email avec lien d'acceptation
- 📊 `startup_founder_added` (avec variante)

### 5.4 A invite un member (role ADMIN / MEMBER)
- Cas existant : 💾 StartupInvitation + 🔔 **STARTUP_INVITATION** à B + 📊 `startup_member_invited`
- Cas nouveau : 💾 StartupInvitation + 📧 email avec token

### 5.5 B accepte une startup invitation
- 💾 `StartupInvitation.status=ACCEPTED`, `StartupMember` créé
- 📊 `startup_invitation_responded`
- 🔔 À A (founder) — "B a rejoint votre startup" (à vérifier si implémenté)

### 5.6 B refuse une invitation
- 💾 `StartupInvitation.status=DECLINED`
- 📊 `startup_invitation_responded`

### 5.7 A crée une invitation investor
- 💾 `InvestorInvitation` + token
- 🔔 **INVESTOR_INVITATION** à B (si profileId connu)
- 📧 Email à B avec token URL

### 5.8 A transfère l'ownership
- 💾 A.role=ADMIN, B.role=SUPER_ADMIN (atomique)
- 📊 `startup_ownership_transferred`
- 🔔 À B — à vérifier

### 5.9 A ajoute un round de funding
- 💾 `FundingHistory` créé
- 📧 Pour chaque investor invité au round → email
- 🔔 Pour chaque investor à l'app → INVESTOR_INVITATION
- 📊 `funding_history_created`

### 5.10 A retire un member / le member quitte
- 💾 `StartupMember` supprimé, equity retirée
- 📊 `startup_member_removed` ou `startup_member_left`
- ❌ Pas de notif explicite (à confirmer — peut frustrer l'exclu)

---

## 6. Dataroom

### 6.1 A crée un dataroom
- 💾 `Dataroom` + groupes par défaut (Founders, Investors, …) + Member(A, Founders)
- 📊 `dataroom_created`

### 6.2 A invite B au dataroom
- Cas existant : 💾 `DataroomInvitation` + 🔔 **DATAROOM_UPDATE** à B
- Cas nouveau : 💾 invitation + 📧 email

### 6.3 A upload un fichier
- 💾 `File` + storage key généré, Category upsert
- 📊 `dataroom_file_uploaded`
- 🔔 **DATAROOM_ENGAGEMENT** aux autres members ? **À vérifier** (type existe mais n'est pas câblé dans upload-file.handler)
- ⚠️ **Gap probable** : les autres members du dataroom ne sont probablement pas notifiés de l'upload. À décider/implémenter.

### 6.4 A consulte / télécharge un fichier
- 💾 `TrackingEvent` (FILE_VIEW / FILE_DOWNLOAD) créé
- 🔔 **DATAROOM_ENGAGEMENT** au founder du dataroom (probablement throttlé)
- ⚠️ **À vérifier** : throttling par-user-par-fichier pour éviter spam

### 6.5 A supprime un fichier
- 💾 `File.isDeleted=true`
- ❌ Pas de notif

### 6.6 B accepte l'invitation au dataroom
- 💾 `Member` créé dans le groupe défini par l'invitation
- 🔔 À A — "B a rejoint votre dataroom" (à vérifier)

---

## 7. Référral & Waitlist

### 7.1 Signup avec `?ref=<userCode>` (Flow C)
- 💾 `User` + `Profile` + `Referral` (status=PENDING, referrerProfileId=B)
- 💾 `A.waitlistStatus=WAITING`, `A.referredByCode=code`
- 📧 Email de vérification à A
- 📊 `user_signed_up`, `profile_created`

### 7.2 A complète son onboarding
- 💾 `Referral.status=ACCEPTED`, `acceptedAt=now()`
- 🔔 **REFERRAL_ACCEPTED** à B (le parrain) — "A a accepté votre invitation"
- 📊 `referral_accepted` (à vérifier PostHog name)

### 7.3 B atteint 10 referrals acceptés
- 💾 `B.waitlistStatus=ACTIVE`, `activatedAt=now()`
- 💾 `UserBadge` FOUNDING_MEMBER créé pour B
- 📧 Email congratulations à B
- 🔔 À B — "Félicitations, vous êtes Founding Member !" (à vérifier)
- ❌ Pas de PostHog explicite (à confirmer)

### 7.4 Signup avec `?ref=<ambassadorCode>` (Flow B)
- 💾 `Referral` status=ACCEPTED immédiat, referrerType=AMBASSADOR
- 💾 `A.waitlistStatus=ACTIVE`
- ❌ Pas de badge
- ❌ Pas de notif au ambassador (c'est un lien public)

### 7.5 Admin active manuellement un user (`POST /admin/waitlist/:profileId/accept`)
- 💾 `Profile.waitlistStatus=ACTIVE`, `activatedAt=now()`
- 💾 `UserBadge` EARLY_ADOPTER créé (à vérifier)
- 📧 Email "welcome, vous êtes in" envoyé
- 📊 `waitlist_activated_by_admin`

### 7.6 Admin bulk active
- Comme 7.5 pour chaque profile dans le batch
- 📊 `waitlist_activated_by_admin` N× (attribué par profile)

### 7.7 User WAITING toggle leaderboard opt-in
- 💾 `Profile.leaderboardOptIn=true/false`
- 📊 `leaderboard_opt_in_toggled`

---

## 8. Auth & Sessions

### 8.1 Signup email
- 💾 `User` + session initiale
- 📧 Email de vérification (code OTP)
- 📊 `user_signed_up`
- ❌ Pas de `Profile` encore (créé pendant onboarding)

### 8.2 Signin depuis nouveau device / IP
- 💾 `Session` créée avec fingerprint IP+UA
- 📧 **Possible** (sessions.service.ts:199) — "new device login" email si device inconnu. **À vérifier en QA.**
- 📊 `user_signed_in`

### 8.3 Signin OAuth Google
- 💾 `User` + `Session`
- 📊 `user_authenticated_google`

### 8.4 Signin OAuth LinkedIn
- 💾 idem, `user_authenticated_linkedin`

### 8.5 A demande password reset
- 💾 `PasswordResetToken` créé
- 📧 Email avec lien + code
- ❌ Pas de PostHog (sécurité)

### 8.6 A change son mot de passe (logged-in)
- 💾 `User.password` mis à jour (bcrypt)
- 📊 `password_updated`
- ⚠️ **À vérifier** : est-ce que les autres sessions de A sont invalidées ? Best practice = oui.

### 8.7 A confirme son email
- 💾 `User.isEmailVerified=true`
- ❌ Pas de PostHog spécifique (à confirmer)

---

## 9. Profil, Experience, Education

### 9.1 A crée son profil (fin d'onboarding)
- 💾 `Profile` créé, `referralCode` généré, badges éventuels
- 💾 Si `referredByCode` présent → acceptance du Referral (voir 7.2)
- 📊 `profile_created`

### 9.2 A édite son profil
- 💾 `Profile` updated
- 📊 `profile_updated`
- ❌ Pas de notif aux followers (par design)

### 9.3 A ajoute/édite une experience
- 💾 `Experience` CRUD
- 📊 `experience_added` / `experience_updated` / `experience_deleted`
- ❌ Pas de notif

### 9.4 Batch update experiences (onboarding LinkedIn)
- 💾 Plusieurs `Experience` créés en transaction
- 📊 `experiences_batch_updated` { count }

### 9.5 A applique un sync LinkedIn
- 💾 Profile + Experience + Education + Skills mis à jour selon les champs cochés
- 📊 `linkedin_sync_applied` { fields_count }

---

## 10. Feedback & Reports

### 10.1 A envoie un feedback (bug/suggestion)
- 💾 `Feedback` créé, screenshot stocké si fourni
- 📊 `feedback_submitted`
- 🔗 **Discord webhook** `DISCORD_WEBHOOK_OPS_FEEDBACK` (si configuré)
- ❌ Pas d'email à A (à confirmer)

### 10.2 A signale un post/user
- 💾 `Report` créé
- 📊 `content_reported`
- 🔗 Possiblement Discord webhook (à vérifier)

### 10.3 Erreur 500 sur une route
- 🔗 **Discord webhook** `DISCORD_WEBHOOK_OPS_ALERTS`
- 📊 Sentry capture (depuis fix P0)
- 💾 Log error stack

---

## Comment utiliser cette matrice en QA

**Méthode recommandée** : tu ouvres 2 navigateurs (A et B, profils connectés différents). Pour chaque ligne :

1. A déclenche l'action
2. Tu vérifies chaque effet listé :
   - 🔔 ouvre le panneau Notifications de B → la notif apparaît
   - 📧 ouvre la boîte mail de B → email reçu
   - ⚡ DevTools → Network → WS de B → frame reçue
   - 📊 PostHog dashboard → event enregistré avec les bons props
   - 🔗 Discord ops channel → alert/message posté
   - 💾 Prisma Studio ou UI → row modifié

**Priorité test** (si tu veux pas tout faire) :
1. Section 2 (Discussions) — **gaps probables**, à vérifier en priorité
2. Section 4 (Messaging) — WebSocket real-time = fragile
3. Section 7 (Referral) — le flow C à 10 refs est LE moment critique du launch
4. Section 5.1-5.4 (Startup invitations) — email flow

**Si tu trouves un gap** : me l'indiquer, je fix (ajout d'un `notifyXxx` dans le handler concerné).
