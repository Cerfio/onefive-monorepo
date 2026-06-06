#!/usr/bin/env bash
# Link all OneFive Vercel projects to Onefive-Social-Network/onefive-monorepo with monorepo root dirs.
# Prerequisite: GitHub → Settings → Applications → Vercel → grant access to Onefive-Social-Network/onefive-monorepo
# Hobby plan: org repo must be public (or use Vercel Pro for private org repos).
set -euo pipefail

TEAM="${VERCEL_TEAM_ID:-team_3QihOIXdtntLouu3zu85VyxT}"
REPO="Onefive-Social-Network/onefive-monorepo"
BRANCH="main"
TOKEN=$(python3 -c "import json,os; print(json.load(open(os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json')))['token'])")

link_project() {
  local project_id="$1"
  local root="$2"
  curl -fsS -X POST "https://api.vercel.com/v9/projects/${project_id}/link?teamId=${TEAM}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"github\",\"repo\":\"${REPO}\",\"productionBranch\":\"${BRANCH}\"}" >/dev/null
  curl -fsS -X PATCH "https://api.vercel.com/v9/projects/${project_id}?teamId=${TEAM}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"rootDirectory\":\"${root}\"}" >/dev/null
  echo "OK ${project_id} -> ${REPO} (root: ${root})"
}

link_project prj_rZ1IWRHyTypMvutFQsKGnfDVcDxH onefive-web
link_project prj_wzFfAyEuC9PeURQ3y7sg2bFyN3Km landing-page
link_project prj_qBVSDjkPydj6Va6t4fyIDr5VYTwC onefive-bo-landing-page
link_project prj_vieVdubbGpVv9bduzvIlaFCZDTBf onefive-backoffice
link_project prj_Jdqek3cDDn91SEFWvkM0oaIvGckn onefive-email

echo "Done. Push to ${REPO} on main to trigger deploys."
