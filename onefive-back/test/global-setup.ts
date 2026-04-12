import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

let globalPg: any;

export async function setup() {
  let dbUrl = process.env.TEST_DATABASE_URL;

  if (!dbUrl) {
    console.log('🚀 Starting global PostgreSQL container (Testcontainers)...');
    globalPg = await new PostgreSqlContainer()
      // .withReuse() // Temporarily disabled to ensure fresh DB with latest schema
      .start();
    dbUrl = `postgresql://${globalPg.getUsername()}:${globalPg.getPassword()}@${globalPg.getHost()}:${globalPg.getPort()}/${globalPg.getDatabase()}`;
    process.env.TEST_DATABASE_URL = dbUrl;
  } else {
    console.log('⚡ Using existing TEST_DATABASE_URL (skip Testcontainers)');
  }

  // Générer le schéma Prisma pour les tests
  const projectRoot = resolve(__dirname, '..');
  const header = readFileSync(
    join(projectRoot, 'prisma', 'schema.prisma'),
    'utf8',
  );
  const modelsDir = join(projectRoot, 'prisma', 'schema');
  const modelFiles = readdirSync(modelsDir)
    .filter((f) => f.endsWith('.prisma') && f !== 'schema.prisma')
    .sort();
  const models = modelFiles
    .map((f) => readFileSync(join(modelsDir, f), 'utf8'))
    .join('\n\n');
  const e2eSchemaPath = join(projectRoot, 'prisma', 'e2e.schema.prisma');
  writeFileSync(e2eSchemaPath, `${header}\n\n${models}`);

  // Générer le client et pousser le schéma
  console.log('📦 Generating Prisma client...');
  execSync(`npx prisma generate --schema ${e2eSchemaPath}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env },
  });

  console.log('🗄️  Pushing schema to test database...');
  execSync(
    `npx prisma db push --skip-generate --accept-data-loss --schema ${e2eSchemaPath}`,
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    },
  );

  // Manual fix: Ensure attempts column exists (db push sometimes skips it)
  console.log('🔧 Applying manual schema fixes...');
  const { Client } = await import('pg');
  const client = new Client({ connectionString: dbUrl! });
  try {
    await client.connect();
    // Add attempts column if it doesn't exist
    await client.query(`
      ALTER TABLE "PasswordReset" 
      ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
    `);
    // Add lastSignupAttemptAt for signup-existing-email flow
    await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "lastSignupAttemptAt" TIMESTAMP(3);
    `);
    await client.query(`
      ALTER TABLE "Session"
      ADD COLUMN IF NOT EXISTS "isOtpOnlySession" BOOLEAN NOT NULL DEFAULT false;
    `);
    await client.end();
    console.log('✅ Schema fixes applied');
  } catch (error) {
    console.warn('⚠️  Could not apply schema fixes:', error.message);
    if (client) await client.end();
  }

  console.log('✅ Global setup complete!');
}

export async function teardown() {
  console.log('🧹 Cleaning up global PostgreSQL container...');
  if (globalPg) {
    await globalPg.stop();
  }
}

// Jest globalSetup requires module.exports = function (SWC ignoreInterop compat)
module.exports = setup;
