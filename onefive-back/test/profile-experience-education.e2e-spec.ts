/**
 * Profile + Experience + Education + Skills CRUD smoke + IDOR + validation.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createExperienceData,
  createEducationData,
} from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Profile + Experience + Education CRUD + IDOR', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('GET /profile/self returns own profile', async () => {
    const u = await createAuthenticatedUser(app, request, 'p-self');
    const res = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${u.token}`)
      .expect(200);
    expect(res.body.data.id).toBe(u.profileId);
  });

  it('GET /profile/:id returns another user\'s profile (public read)', async () => {
    const a = await createAuthenticatedUser(app, request, 'p-pub-a');
    const b = await createAuthenticatedUser(app, request, 'p-pub-b');
    const res = await request(app.getHttpServer())
      .get(`/profile/${b.profileId}`)
      .set('Cookie', `token=${a.token}`)
      .expect(200);
    expect(res.body.data.id).toBe(b.profileId);
  });

  // UpdateProfileDto requires firstName, lastName, title, bio (all @IsNotEmpty)
  const fullProfileBody = (overrides: Record<string, unknown> = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    title: 'Developer',
    bio: 'Default bio',
    ...overrides,
  });

  it('PUT /profile updates own profile (bio)', async () => {
    const u = await createAuthenticatedUser(app, request, 'p-up');
    await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', `token=${u.token}`)
      .send(fullProfileBody({ bio: 'Updated bio here' }))
      .expect((r) => {
        if (![200, 201, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const profile = await prisma.profile.findUnique({ where: { id: u.profileId } });
    expect(profile?.bio).toBe('Updated bio here');
  });

  it('XSS sanitize: <script> in bio is stripped', async () => {
    const u = await createAuthenticatedUser(app, request, 'p-xss');
    await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', `token=${u.token}`)
      .send(fullProfileBody({ bio: 'My bio <script>alert(1)</script> end' }))
      .expect((r) => {
        if (![200, 201, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const profile = await prisma.profile.findUnique({ where: { id: u.profileId } });
    expect(profile?.bio || '').not.toMatch(/<script>/i);
  });

  it('Experience CRUD: create + delete own', async () => {
    const u = await createAuthenticatedUser(app, request, 'exp-cu');

    const createRes = await request(app.getHttpServer())
      .post('/experience')
      .set('Cookie', `token=${u.token}`)
      .send(createExperienceData())
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    const expId = createRes.body.data.id;
    expect(expId).toBeTruthy();

    await request(app.getHttpServer())
      .delete(`/experience/${expId}`)
      .set('Cookie', `token=${u.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });

  it('Experience IDOR: another user cannot delete my experience', async () => {
    const u = await createAuthenticatedUser(app, request, 'exp-id-a');
    const attacker = await createAuthenticatedUser(app, request, 'exp-id-b');

    const createRes = await request(app.getHttpServer())
      .post('/experience')
      .set('Cookie', `token=${u.token}`)
      .send(createExperienceData());
    const expId = createRes.body.data.id;

    const res = await request(app.getHttpServer())
      .delete(`/experience/${expId}`)
      .set('Cookie', `token=${attacker.token}`);
    // Service throws ExperienceUnauthorizedException → 401
    expect([400, 401, 403, 404]).toContain(res.status);

    // Still exists
    const exp = await prisma.experience.findUnique({ where: { id: expId } });
    expect(exp).not.toBeNull();
  });

  it('Education CRUD: create + delete own', async () => {
    const u = await createAuthenticatedUser(app, request, 'edu-cu');
    const res = await request(app.getHttpServer())
      .post('/education')
      .set('Cookie', `token=${u.token}`)
      .send(createEducationData())
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    const eduId = res.body.data.id;
    await request(app.getHttpServer())
      .delete(`/education/${eduId}`)
      .set('Cookie', `token=${u.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });

  it('Skills batch update via PUT /profile/skills-interests', async () => {
    const u = await createAuthenticatedUser(app, request, 'skills');
    await request(app.getHttpServer())
      .put('/profile/skills-interests')
      .set('Cookie', `token=${u.token}`)
      .send({ skills: ['TypeScript', 'NestJS', 'React'], interests: ['Startups'] })
      .expect((r) => {
        if (![200, 201, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const profile = await prisma.profile.findUnique({ where: { id: u.profileId } });
    expect(profile?.skills).toEqual(expect.arrayContaining(['TypeScript', 'NestJS']));
  });
});
