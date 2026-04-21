/**
 * Admin backoffice — login, waitlist management, audit logs.
 * Setup : on crée un AdminUser isSuperAdmin=true directement en DB (bypass
 * invitation flow qui nécessite emails), puis on signin pour récupérer le
 * cookie admin_token.
 */
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createUserInWaitlist } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Admin backoffice — signin + user/waitlist management + audit log', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let adminEmail: string;
  let adminPassword: string;
  let adminToken: string;

  // AdminService.hashPassword appends KEY_AUTHENTICATION — must match that
  async function hashAdminPassword(password: string) {
    return bcrypt.hash(password + (process.env.KEY_AUTHENTICATION ?? ''), 1);
  }

  async function createSuperAdmin() {
    adminEmail = `admin-${Date.now()}@example.com`;
    adminPassword = 'AdminPass123!';
    const hashed = await hashAdminPassword(adminPassword);
    return prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashed,
        firstName: 'Test',
        lastName: 'Admin',
        isActive: true,
        isSuperAdmin: true,
      },
    });
  }

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    installMocks(app);
    await createSuperAdmin();

    // Signin once, reuse token for subsequent tests
    const res = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({ email: adminEmail, password: adminPassword });
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Admin signin failed:', res.status, res.body);
      throw new Error('Admin signin failed in beforeAll');
    }
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const tokenCookie = setCookie.find((c: string) => c.startsWith('admin_token='));
    if (!tokenCookie) throw new Error('No admin_token cookie returned');
    adminToken = tokenCookie.split(';')[0].slice('admin_token='.length);
    expect(adminToken).toBeTruthy();
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('signin returns admin profile + sets HttpOnly cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(adminEmail);

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const cookie = setCookie.find((c: string) => c.startsWith('admin_token='));
    expect(cookie).toBeDefined();
    expect(cookie!.toLowerCase()).toContain('httponly');
    expect(cookie!.toLowerCase()).toContain('samesite=lax');
  });

  it('bad password → 401/400', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({ email: adminEmail, password: 'WrongPassword1' });
    expect([400, 401, 403]).toContain(res.status);
  });

  it('GET /admin/auth/me returns the signed-in admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/auth/me')
      .set('Cookie', `admin_token=${adminToken}`)
      .expect(200);
    expect(res.body.data.email).toBe(adminEmail);
    expect(res.body.data.isSuperAdmin).toBe(true);
  });

  it('GET /admin/users returns list with pagination', async () => {
    // Create a couple of regular users
    await createUserInWaitlist(app, request, 'adm-list1');
    await createUserInWaitlist(app, request, 'adm-list2');

    const res = await request(app.getHttpServer())
      .get('/admin/users?take=10')
      .set('Cookie', `admin_token=${adminToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('PATCH /admin/waitlist/:profileId/accept activates the profile + creates audit log', async () => {
    const target = await createUserInWaitlist(app, request, 'adm-accept');
    expect((await prisma.profile.findUniqueOrThrow({ where: { id: target.profileId } })).waitlistStatus).toBe('WAITING');

    const res = await request(app.getHttpServer())
      .patch(`/admin/waitlist/${target.profileId}/accept`)
      .set('Cookie', `admin_token=${adminToken}`)
      .expect(204);

    const profile = await prisma.profile.findUniqueOrThrow({ where: { id: target.profileId } });
    expect(profile.waitlistStatus).toBe('ACTIVE');

    // Audit log entry
    const audits = await prisma.adminAuditLog.findMany({
      where: { resourceType: 'profile', resourceId: target.profileId },
      orderBy: { createdAt: 'desc' },
    });
    expect(audits.length).toBeGreaterThanOrEqual(1);
    expect(audits[0].action).toBe('admin.waitlist.accept');
  });

  it('unauthenticated request → 401 on protected admin route', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/users');
    expect([401, 403]).toContain(res.status);
  });

  it('signin with a disabled admin is rejected', async () => {
    // Create a disabled admin
    const email = `disabled-${Date.now()}@example.com`;
    const password = 'AdminPass123!';
    const hashed = await hashAdminPassword(password);
    await prisma.adminUser.create({
      data: {
        email,
        password: hashed,
        isActive: false,
        isSuperAdmin: false,
      },
    });

    const res = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({ email, password });
    expect([400, 401, 403]).toContain(res.status);
  });

  it('POST /admin/auth/logout revokes the session (next request 401)', async () => {
    // Fresh signin
    const signin = await request(app.getHttpServer())
      .post('/admin/auth/signin')
      .send({ email: adminEmail, password: adminPassword });
    const cookies = signin.headers['set-cookie'] as unknown as string[];
    const token = cookies.find((c: string) => c.startsWith('admin_token='))!
      .split(';')[0].slice('admin_token='.length);

    await request(app.getHttpServer())
      .post('/admin/auth/logout')
      .set('Cookie', `admin_token=${token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`logout ${r.status}`);
      });

    // Next call with the same token should be rejected
    const after = await request(app.getHttpServer())
      .get('/admin/auth/me')
      .set('Cookie', `admin_token=${token}`);
    expect([401, 403]).toContain(after.status);
  });
});
