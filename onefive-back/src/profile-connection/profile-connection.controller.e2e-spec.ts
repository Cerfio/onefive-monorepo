import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('ProfileConnectionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let tokenA: string;
  let profileIdA: string;
  let tokenB: string;
  let profileIdB: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    // User A
    const signupA = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('connA'), password: validPassword })
      .expect(201);
    tokenA = signupA.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${tokenA}`)
      .send(createProfileData({ firstName: 'Alice' }))
      .expect(201);
    const selfA = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${tokenA}`)
      .expect(200);
    profileIdA = selfA.body.data.id;

    // User B
    const signupB = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail('connB'), password: validPassword })
      .expect(201);
    tokenB = signupB.body.data.token;
    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${tokenB}`)
      .send(createProfileData({ firstName: 'Bob' }))
      .expect(201);
    const selfB = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${tokenB}`)
      .expect(200);
    profileIdB = selfB.body.data.id;
  });

  // ── POST /profiles/:profileId/connect ─────────────────
  describe('POST /profiles/:profileId/connect', () => {
    it('should send a connection request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/connect`)
        .set('Cookie', `token=${tokenA}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/connect`)
        .expect(401);
    });
  });

  // ── PATCH /profiles/:profileId/connect/accept ─────────
  describe('PATCH /profiles/:profileId/connect/accept', () => {
    it('should accept a connection request', async () => {
      // A sends to B
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/connect`)
        .set('Cookie', `token=${tokenA}`)
        .expect(201);

      // B accepts from A
      const res = await request(app.getHttpServer())
        .patch(`/profiles/${profileIdA}/connect/accept`)
        .set('Cookie', `token=${tokenB}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── PATCH /profiles/:profileId/connect/reject ─────────
  describe('PATCH /profiles/:profileId/connect/reject', () => {
    it('should reject a connection request', async () => {
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/connect`)
        .set('Cookie', `token=${tokenA}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/profiles/${profileIdA}/connect/reject`)
        .set('Cookie', `token=${tokenB}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── DELETE /profiles/:profileId/connect ────────────────
  describe('DELETE /profiles/:profileId/connect', () => {
    it('should remove a connection', async () => {
      // Create and accept
      await request(app.getHttpServer())
        .post(`/profiles/${profileIdB}/connect`)
        .set('Cookie', `token=${tokenA}`)
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/profiles/${profileIdA}/connect/accept`)
        .set('Cookie', `token=${tokenB}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .delete(`/profiles/${profileIdB}/connect`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ── GET /profiles/connections ──────────────────────────
  describe('GET /profiles/connections', () => {
    it('should get connections list', async () => {
      const res = await request(app.getHttpServer())
        .get('/profiles/connections')
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // ── GET /profiles/connections/pending ──────────────────
  describe('GET /profiles/connections/pending', () => {
    it('should get pending connection requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/profiles/connections/pending')
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // ── GET /profiles/:profileId/connection-status ────────
  describe('GET /profiles/:profileId/connection-status', () => {
    it('should get connection status between two profiles', async () => {
      const res = await request(app.getHttpServer())
        .get(`/profiles/${profileIdB}/connection-status`)
        .set('Cookie', `token=${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
