# Runbook — Deploy & Rollback onefive

Procédures opérationnelles pour déployer et rollback onefive en production.

---

## 1. Pre-deploy checklist

À valider **avant** chaque deploy prod.

### Secrets & env
- [ ] `SESSION_SECRET` ≥ 32 chars, unique prod (jamais la valeur dev)
- [ ] `DATABASE_URL` pointe vers la DB prod avec PostGIS activé
- [ ] `CORS_ALLOWED_ORIGINS` = uniquement les origines prod (HTTPS), pas de `localhost`
- [ ] `FRONTEND_URL` = URL prod HTTPS
- [ ] `KEY_AUTHENTICATION` unique prod
- [ ] OAuth client IDs/secrets = credentials prod (LinkedIn, Google)
- [ ] Callback URLs OAuth côté Google/LinkedIn console pointent vers prod
- [ ] `ONEFIVE_MICROSERVICE_EMAIL_API_KEY` = même valeur que `API_KEY` côté microservice email
- [ ] `RESEND_API_KEY` configuré côté email microservice
- [ ] `R2_*` credentials = bucket prod (pas LocalStack)
- [ ] `TWILIO_*` credentials prod
- [ ] `POSTHOG_API_KEY`, `SENTRY_DSN` remplis (monitoring)
- [ ] `NODE_ENV=production` partout

### Frontend env (web + backoffice + landing)
- [ ] `NEXT_PUBLIC_API_URL` = URL backend prod HTTPS
- [ ] `NEXT_PUBLIC_WS_URL` = URL WebSocket prod (wss://)
- [ ] `NEXT_PUBLIC_URL_PUBLIC` = URL publique prod
- [ ] `NEXT_PUBLIC_*_CLIENT_ID` remplis (Google, LinkedIn, Google Maps)
- [ ] `NEXT_PUBLIC_AUTH_REDIRECT_URI*` pointent vers prod
- [ ] `NEXT_PUBLIC_FRONTEND_URL` côté backoffice = URL web prod
- [ ] `NEXT_PUBLIC_STORAGE_BASE_URL` = R2 public URL prod

### Code
- [ ] Tous les tests backend passent (`pnpm test:unit` + `pnpm test:e2e:security`)
- [ ] `pnpm build` passe sur tous les packages (`turbo run build`)
- [ ] Lint/typecheck green
- [ ] Git tag créé (`git tag v1.0.0 && git push --tags`)

### Infrastructure
- [ ] DB backup/snapshot pris avant deploy
- [ ] Migration Prisma testée sur copie de la DB prod (voir §3)
- [ ] Monitoring en place (Sentry, uptime, PostHog)
- [ ] Plan de communication waitlist prêt

---

## 2. Premier deploy (bootstrap)

Une seule fois, à la création de l'environnement prod.

```bash
# 1. Provisionner la DB Postgres + PostGIS
psql -h $DB_HOST -U postgres -c "CREATE DATABASE onefive;"
psql -h $DB_HOST -U postgres -d onefive -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 2. Appliquer toutes les migrations
cd onefive-back && pnpm prisma migrate deploy --schema=./prisma/schema/

# 3. (Optionnel) Créer l'admin initial via ADMIN_BOOTSTRAP_* dans .env prod
# Au premier boot du backend, le compte SUPER_ADMIN sera créé automatiquement
# Puis vider ADMIN_BOOTSTRAP_EMAIL/PASSWORD dans .env après validation

# 4. Seed badges (EARLY_ADOPTER, FOUNDING_MEMBER)
pnpm prisma db seed --schema=./prisma/schema/

# 5. Lancer le backend
pnpm build && pnpm start:prod
```

---

## 3. Deploy routine

```bash
# 1. Sur le serveur / CI
git fetch --tags
git checkout v1.x.x  # tag release

# 2. Install deps
pnpm install --frozen-lockfile

# 3. Generate Prisma client + build
cd onefive-back
pnpm prisma generate --schema=./prisma/schema/
pnpm build

# 4. Apply migrations (idempotent)
pnpm prisma migrate deploy --schema=./prisma/schema/

# 5. Restart service (zero-downtime si load balancer)
# Docker: docker compose up -d --no-deps --build onefive-back
# PM2:    pm2 reload onefive-back
# k8s:    kubectl rollout restart deployment/onefive-back

# 6. Frontend (web + backoffice + landing)
pnpm build  # turbo build tout le monorepo
# Deploy .next/ sur Vercel, Cloudflare Pages, ou équivalent
```

### Tester une migration avant deploy

```bash
# Copie la DB prod en local (ou sur DB de staging)
pg_dump $PROD_DATABASE_URL > /tmp/prod_snapshot.sql
createdb onefive_migration_test
psql onefive_migration_test < /tmp/prod_snapshot.sql

# Appliquer la nouvelle migration sur la copie
DATABASE_URL=postgresql://localhost/onefive_migration_test \
  pnpm prisma migrate deploy --schema=./prisma/schema/

# Vérifier : pas d'erreur, schéma cohérent
DATABASE_URL=postgresql://localhost/onefive_migration_test \
  pnpm prisma validate --schema=./prisma/schema/
```

---

## 4. Rollback

Trois niveaux selon le type de régression détectée.

### Niveau 1 — Bug code uniquement (pas de schéma DB changé)

Le plus simple et le plus fréquent. Redéployer la version précédente.

```bash
git checkout v1.x.x-previous
pnpm install --frozen-lockfile
cd onefive-back && pnpm build
# Restart service (voir §3 étape 5)
```

Temps : ~5 min. Aucune perte de données.

### Niveau 2 — Migration de schéma rétrocompatible

Ex. : ajout d'une colonne NULLABLE, ajout d'un index. L'ancien code tourne sans problème avec le nouveau schéma.

→ **Même procédure que Niveau 1** (rollback code). Laisser le schéma en place. Corriger le code, redéployer.

### Niveau 3 — Migration de schéma cassante (BREAKING)

Ex. : `DROP COLUMN`, `ALTER COLUMN NOT NULL`, rename de table. L'ancien code ne tourne plus sur le nouveau schéma.

**⚠️ À éviter au maximum**. Si c'est inévitable :

```bash
# 1. Stopper le service (downtime accepté)
docker compose stop onefive-back

# 2. Restaurer le snapshot DB pré-deploy
psql $PROD_DATABASE_URL -c "DROP DATABASE onefive;"
psql $PROD_DATABASE_URL -c "CREATE DATABASE onefive;"
psql $PROD_DATABASE_URL -d onefive < /backups/snapshot_before_deploy.sql

# 3. Redéployer l'ancienne version du code
git checkout v1.x.x-previous
pnpm install --frozen-lockfile
cd onefive-back && pnpm build
docker compose up -d onefive-back
```

Temps : 15-30 min. **Perte de données entre le snapshot et maintenant**.

**Règle d'or** : pour toute migration cassante, préférer la stratégie **expand/contract** en 2 releases :
1. Release N : ajouter nouvelle colonne/table, écrire dans les deux, lire depuis l'ancienne
2. Release N+1 : migrer les lectures, valider, supprimer l'ancienne

---

## 5. Snapshot DB — stratégie

- **Avant chaque deploy prod** : snapshot automatique ou manuel
- **Rétention** : 7 jours minimum (quotidien), 30 jours (hebdomadaire)
- **Commande manuelle** : `pg_dump $PROD_DATABASE_URL | gzip > /backups/onefive_$(date +%Y%m%d_%H%M%S).sql.gz`
- **Cloud** : activer les snapshots automatiques côté provider (AWS RDS, Neon, Supabase, etc.)
- **Tester la restauration** au moins une fois par trimestre

---

## 6. Post-deploy smoke checks

À faire manuellement après chaque deploy, en <5 min.

- [ ] `GET /health` répond 200 (shallow — pour monitoring uptime, fréquence élevée)
- [ ] `GET /health/deep` répond 200 (inclut ping DB — monitoring détaillé, fréquence faible)
- [ ] Homepage web charge sans erreur JS console
- [ ] Signin marche (email + Google + LinkedIn)
- [ ] Création de post (si user déjà ACTIVE)
- [ ] WebSocket messaging se connecte (onglet Messages)
- [ ] Upload dataroom test (1 fichier PDF)
- [ ] Backoffice login admin → dashboard charge
- [ ] Sentry reçoit bien les erreurs (déclencher une 500 volontaire sur une route test puis retirer)
- [ ] Pas d'erreur rouge dans Sentry depuis le deploy
- [ ] Uptime monitor toujours vert

---

## 7. Contacts & escalation

- **DB** : snapshots sur [provider], accès via [admin panel URL]
- **Monitoring** : Sentry ([url]), PostHog ([url]), uptime ([url])
- **OAuth providers** : LinkedIn dev console, Google Cloud Console
- **Storage** : Cloudflare R2 dashboard
- **Email** : Resend dashboard
- **SMS** : Twilio console
