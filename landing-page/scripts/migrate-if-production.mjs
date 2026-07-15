// Preview deployments share DATABASE_URI with Production. Running `payload
// migrate` from a preview build applies an unmerged branch's schema to the
// production database and records it in payload_migrations as "Ran" — after
// which the corrected version of that same migration never runs again. Only
// the Production build may migrate.
//
// Ambiguity fails the build rather than skipping: a wrongly skipped production
// migration is silent (green build, 500s at runtime on the missing table),
// which is the failure mode we can least afford to miss.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { VERCEL, VERCEL_ENV } = process.env

// VERCEL=1 means "system env vars are exposed" — the project toggle that sets
// it also gates VERCEL_ENV, so both vanish together. cwd is not gated by it,
// so it still identifies a Vercel builder when the toggle is off.
const onVercel = VERCEL === '1' || process.cwd().startsWith('/vercel/')

if (!onVercel) {
  console.log('[migrate] local build — skipped. Migrate explicitly: pnpm run migrate')
  process.exit(0)
}

if (!VERCEL_ENV) {
  console.error(
    '[migrate] Running on Vercel but VERCEL_ENV is unset, so preview and\n' +
      '          production cannot be told apart. Both share DATABASE_URI, so\n' +
      '          guessing would risk migrating production from a preview.\n' +
      '          Fix: enable "Automatically expose System Environment Variables"\n' +
      '          in Project Settings > Environment Variables.',
  )
  process.exit(1)
}

if (VERCEL_ENV !== 'production') {
  console.log(
    `[migrate] VERCEL_ENV=${VERCEL_ENV} — skipped (DATABASE_URI points at production).\n` +
      '          A preview that changes the schema will fail until it is merged.',
  )
  process.exit(0)
}

console.log('[migrate] VERCEL_ENV=production — running payload migrate')

// Resolved rather than taken from PATH: PATH only carries node_modules/.bin
// when a package manager sets it up, and this script must not depend on how it
// was invoked.
const localBin = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'node_modules',
  '.bin',
  'payload',
)
const payloadBin = existsSync(localBin) ? localBin : 'payload'

const result = spawnSync(payloadBin, ['migrate', '--force-accept-warning'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
})

if (result.error) {
  console.error('[migrate] could not start payload:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
