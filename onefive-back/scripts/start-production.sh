#!/bin/sh
set -e

pnpm exec prisma migrate deploy --schema=./prisma/schema/
exec node dist/src/main
