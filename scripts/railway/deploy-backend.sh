#!/usr/bin/env bash
# Deploy OneFive backend + PostGIS on Railway (Next.js apps excluded).
# Prerequisite: railway login  (or export RAILWAY_TOKEN)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PROJECT_NAME="${RAILWAY_PROJECT_NAME:-onefive}"
BACK_SERVICE="${RAILWAY_BACK_SERVICE:-onefive-back}"
DB_SERVICE="${RAILWAY_DB_SERVICE:-postgis}"
ENVIRONMENT="${RAILWAY_ENVIRONMENT:-production}"

echo "==> Railway auth"
if ! railway whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: railway login"
  exit 1
fi

echo "==> Project: $PROJECT_NAME"
if ! railway status --json 2>/dev/null | grep -q '"name"'; then
  railway init --name "$PROJECT_NAME"
fi

echo "==> PostGIS database (template postgis-17)"
if ! railway service list --json 2>/dev/null | grep -qi postgis; then
  railway deploy --template postgis-17 || railway add --database postgres
fi

echo "==> Backend service: $BACK_SERVICE"
if ! railway service list --json 2>/dev/null | grep -qi "$BACK_SERVICE"; then
  railway add --service "$BACK_SERVICE"
fi

echo "==> Wire GitHub repo (monorepo root, Dockerfile onefive-back/)"
railway environment edit \
  --service-config "$BACK_SERVICE" \
  source.repo "Onefive-Social-Network/onefive-monorepo" || true

railway environment edit \
  --service-config "$BACK_SERVICE" \
  build.builder DOCKERFILE || true

railway environment edit \
  --service-config "$BACK_SERVICE" \
  build.dockerfilePath "onefive-back/Dockerfile" || true

echo "==> Core variables (set secrets manually in Railway dashboard if missing)"
railway variable set \
  NODE_ENV=production \
  PORT=3000 \
  DATABASE_URL='${{'"$DB_SERVICE"'.DATABASE_URL}}' \
  --service "$BACK_SERVICE" \
  --environment "$ENVIRONMENT" \
  --skip-deploys 2>/dev/null || true

cat <<'EOF'

Next manual steps in Railway (Settings → Variables for onefive-back):
  - SESSION_SECRET          (openssl rand -hex 32)
  - KEY_AUTHENTICATION      (openssl rand -hex 32)
  - FRONTEND_URL            (Vercel URLs, comma-separated)
  - CORS_ALLOWED_ORIGINS    (same as FRONTEND_URL in prod)
  - ADMIN_URL               (backoffice URL when deployed)
  - R2_* / STORAGE_URL      (Cloudflare R2)
  - ONEFIVE_MICROSERVICE_EMAIL_URL + API_KEY (or MOCK_EMAIL_SERVICE=true)
  - OAuth / Twilio / Apify as needed

Excluded from Railway (Next.js — deploy on Vercel or elsewhere):
  - onefive-web, onefive-backoffice, landing-page, onefive-bo-landing-page, onefive-email

Deploy:
  railway up --service onefive-back --environment production -m "Deploy onefive-back"

EOF
