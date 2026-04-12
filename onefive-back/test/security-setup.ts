import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { createApp } from '../src/main';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

export type SecurityTestContext = {
  app: INestApplication;
  baseUrl: string;
  pg: Awaited<ReturnType<PostgreSqlContainer['start']>>;
  teardown: () => Promise<void>;
};

export async function setupSecurityTests(): Promise<SecurityTestContext> {
  const pg = await new PostgreSqlContainer().start();
  const dbUrl = `postgresql://${pg.getUsername()}:${pg.getPassword()}@${pg.getHost()}:${pg.getPort()}/${pg.getDatabase()}`;

  // Configuration pour les tests de sécurité
  process.env.DATABASE_URL = dbUrl;
  process.env.KEY_AUTHENTICATION = 'test-security-key';
  process.env.SESSION_SECRET = 'test-security-session-secret';
  process.env.PORT = '0';
  process.env.NODE_ENV = 'test';
  process.env.FRONTEND_URL = 'http://localhost:3000';

  // Configuration Prisma pour les tests
  const projectRoot = resolve(__dirname, '..');
  const header = readFileSync(
    join(projectRoot, 'prisma', 'schema.prisma'),
    'utf8',
  );
  const modelsDir = join(projectRoot, 'prisma', 'models');
  const modelFiles = readdirSync(modelsDir)
    .filter((f) => f.endsWith('.prisma'))
    .sort();
  const models = modelFiles
    .map((f) => readFileSync(join(modelsDir, f), 'utf8'))
    .join('\n\n');
  const testSchemaPath = join(
    projectRoot,
    'prisma',
    'test-security.schema.prisma',
  );
  writeFileSync(testSchemaPath, `${header}\n\n${models}`);

  // Générer le client et pousser le schéma
  execSync(`npx prisma generate --schema ${testSchemaPath}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env },
  });
  execSync(`npx prisma db push --skip-generate --schema ${testSchemaPath}`, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  // Démarrer l'application
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

// Utilitaires pour les tests de sécurité
export class SecurityTestUtils {
  static generateValidPassword(): string {
    return 'ValidPass123!';
  }

  static generateInvalidPasswords(): string[] {
    return [
      '123', // Trop court
      'password', // Pas de majuscule/chiffre/symbole
      'Password', // Pas de chiffre/symbole
      'Password123', // Pas de symbole
      'password123!', // Pas de majuscule
      'PASSWORD123!', // Pas de minuscule
      '', // Vide
    ];
  }

  static generateValidEmails(): string[] {
    return [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user123@test-domain.com',
      'a@b.co',
    ];
  }

  static generateInvalidEmails(): string[] {
    return [
      'invalid-email',
      '@example.com',
      'test@',
      'test.example.com',
      '',
      'test@.com',
      'test..test@example.com',
    ];
  }

  static generateMaliciousInputs(): any[] {
    return [
      {
        email: 'test@example.com',
        password: 'ValidPass123!',
        maliciousField: 'hack attempt',
        admin: true,
        role: 'admin',
      },
      {
        email: 'test@example.com',
        password: 'ValidPass123!',
        '; DROP TABLE users;': 'sql injection',
      },
      {
        email: 'test@example.com',
        password: 'ValidPass123!',
        '<script>alert("xss")</script>': 'xss attempt',
      },
    ];
  }

  static async makeConcurrentRequests(
    app: INestApplication,
    endpoint: string,
    count: number,
    data?: any,
  ): Promise<any[]> {
    const requests = [];

    for (let i = 0; i < count; i++) {
      const requestData = data
        ? { ...data, email: `test${i}@example.com` }
        : {};
      requests.push(
        require('supertest')(app.getHttpServer())
          .post(endpoint)
          .send(requestData),
      );
    }

    return Promise.all(requests);
  }

  static measurePerformance<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve) => {
      const startTime = Date.now();
      const result = await fn();
      const endTime = Date.now();
      const duration = endTime - startTime;

      resolve({ result, duration });
    });
  }

  static extractSecurityHeaders(response: any): Record<string, string> {
    const headers = response.headers;
    return {
      'x-content-type-options': headers['x-content-type-options'],
      'x-frame-options': headers['x-frame-options'],
      'x-xss-protection': headers['x-xss-protection'],
      'strict-transport-security': headers['strict-transport-security'],
      'content-security-policy': headers['content-security-policy'],
      'referrer-policy': headers['referrer-policy'],
      'x-dns-prefetch-control': headers['x-dns-prefetch-control'],
      'x-download-options': headers['x-download-options'],
      'x-permitted-cross-domain-policies':
        headers['x-permitted-cross-domain-policies'],
    };
  }

  static extractCorsHeaders(response: any): Record<string, string> {
    const headers = response.headers;
    return {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'access-control-allow-methods': headers['access-control-allow-methods'],
      'access-control-allow-headers': headers['access-control-allow-headers'],
      'access-control-expose-headers': headers['access-control-expose-headers'],
    };
  }

  static validateSecurityHeaders(headers: Record<string, string>): void {
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-xss-protection']).toBe('0');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['referrer-policy']).toBeDefined();
  }

  static validateCorsHeaders(headers: Record<string, string>): void {
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toContain('POST');
    expect(headers['access-control-allow-headers']).toContain('Content-Type');
    expect(headers['access-control-allow-headers']).toContain('X-CSRF-Token');
    expect(headers['access-control-expose-headers']).toContain('X-CSRF-Token');
  }
}
