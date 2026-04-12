import { INestApplication } from '@nestjs/common';
import { createApp } from '../../src/main';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

export type E2EContext = {
  app: INestApplication;
  baseUrl: string;
  pg: Awaited<ReturnType<PostgreSqlContainer['start']>>;
  teardown: () => Promise<void>;
};

export async function setupE2E(): Promise<E2EContext> {
  const pg = await new PostgreSqlContainer().start();
  const dbUrl = `postgresql://${pg.getUsername()}:${pg.getPassword()}@${pg.getHost()}:${pg.getPort()}/${pg.getDatabase()}`;

  // Base env for tests; can be overridden by caller or .env.test
  process.env.DATABASE_URL = dbUrl;
  process.env.KEY_AUTHENTICATION = process.env.KEY_AUTHENTICATION ?? 'test-key';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'test-secret';
  process.env.PORT = process.env.PORT ?? '0';

  // Compose a dedicated Prisma schema for tests (header + models)
  const projectRoot = resolve(__dirname, '..', '..');
  const header = readFileSync(
    join(projectRoot, 'prisma', 'schema.prisma'),
    'utf8',
  );
  const modelsDir = join(projectRoot, 'prisma', 'schema');
  const modelFiles = readdirSync(modelsDir)
    .filter((f) => f.endsWith('.prisma') && f !== 'schema.prisma') // Exclude duplicate schema.prisma
    .sort();
  const models = modelFiles
    .map((f) => readFileSync(join(modelsDir, f), 'utf8'))
    .join('\n\n');
  const e2eSchemaPath = join(projectRoot, 'prisma', 'e2e.schema.prisma');
  writeFileSync(e2eSchemaPath, `${header}\n\n${models}`);

  // Generate client & push schema to test DB
  execSync(`npx prisma generate --schema ${e2eSchemaPath}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env },
  });
  execSync(`npx prisma db push --skip-generate --schema ${e2eSchemaPath}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  // Start app on an ephemeral port
  const app = await createApp();
  await app.init();
  await app.listen(0, '0.0.0.0');
  const addressInfo = app.getHttpServer().address();
  const port =
    typeof addressInfo === 'object' && addressInfo
      ? (addressInfo as any).port
      : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function teardown() {
    await app.close();
    await pg.stop();
  }

  return { app, baseUrl, pg, teardown };
}
