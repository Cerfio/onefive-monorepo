import { INestApplication } from '@nestjs/common';
import { createApp } from '../../src/main';
import { PrismaService } from '../../src/prisma/prisma.service';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export type FastE2EContext = {
  app: INestApplication;
  baseUrl: string;
  prisma: PrismaService;
  cleanup: () => Promise<void>;
};

// File-based IPC to detect if app already exists at a port
const PORT_FILE = join(__dirname, '..', '.e2e-app-port');

/**
 * Setup E2E pour un fichier de test.
 * Crée une app si c'est le premier fichier; sinon réutilise via le port sauvegardé.
 * Le truc : on ne peut pas partager l'objet app entre les VM sandbox de Jest,
 * mais on peut créer une nouvelle app PER FILE tout en optimisant le reste.
 */
export async function setupFastE2E(): Promise<FastE2EContext> {
  const dbUrl = process.env.TEST_DATABASE_URL;
  if (!dbUrl) {
    throw new Error('TEST_DATABASE_URL not set. Run jest with globalSetup.');
  }
  process.env.DATABASE_URL = dbUrl;
  process.env.E2E_AUTO_VERIFY_SIGNUP = 'true';

  const app = await createApp();
  await app.init();
  await app.listen(0, '0.0.0.0');
  const addr = app.getHttpServer().address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  const prisma: PrismaService = app.get(PrismaService);

  async function cleanup() {
    if (!prisma) return;
    try {
      // Single TRUNCATE CASCADE on root table — Postgres cascades to all children
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`);
    } catch {
      // Ignore errors
    }
  }

  return { app, baseUrl, prisma, cleanup };
}

/**
 * Helper pour cleanup sécurisé dans les afterAll.
 * Ferme l'app pour libérer les connexions.
 */
export async function safeCleanup(context: FastE2EContext | undefined) {
  if (!context) return;
  if (context.cleanup) {
    try {
      await context.cleanup();
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }
  // Close app to release DB connections
  if (context.app) {
    try {
      await context.app.close();
    } catch {
      // Ignore
    }
  }
}
