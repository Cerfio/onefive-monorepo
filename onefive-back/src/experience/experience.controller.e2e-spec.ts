import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
  createExperienceData,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import { VALIDATION_LIMITS } from '../common/constants/validation-limits.constants';

describe('ExperienceController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(async () => {
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: createUniqueEmail(), password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);
  });

  // ── POST /experience ──────────────────────────────────
  describe('POST /experience', () => {
    it('should create an experience successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${authToken}`)
        .send(createExperienceData())
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/experience')
        .send(createExperienceData())
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should create a current experience (no to date)', async () => {
      const res = await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${authToken}`)
        .send(createExperienceData({ to: undefined }))
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it(`should reject creating more than ${VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE} experiences`, async () => {
      for (let i = 0; i < VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE; i += 1) {
        await request(app.getHttpServer())
          .post('/experience')
          .set('Cookie', `token=${authToken}`)
          .send(createExperienceData({
            title: `Experience ${i}`,
            company: `Company ${i}`,
          }))
          .expect(201);
      }

      await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${authToken}`)
        .send(
          createExperienceData({
            title: 'Experience overflow',
            company: 'Overflow Inc',
          }),
        )
        .expect(400);
    });
  });

  // ── PUT /experience/:experienceId ─────────────────────
  describe('PUT /experience/:experienceId', () => {
    let experienceId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${authToken}`)
        .send(createExperienceData())
        .expect(201);
      experienceId = res.body.data.id;
    });

    it('should update an experience successfully', async () => {
      const res = await request(app.getHttpServer())
        .put(`/experience/${experienceId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'Senior Software Engineer' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/experience/${experienceId}`)
        .send({ title: 'Senior' })
        .expect(401);
    });
  });

  // ── DELETE /experience/:experienceId ──────────────────
  describe('DELETE /experience/:experienceId', () => {
    let experienceId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/experience')
        .set('Cookie', `token=${authToken}`)
        .send(createExperienceData())
        .expect(201);
      experienceId = res.body.data.id;
    });

    it('should delete an experience successfully', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/experience/${experienceId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/experience/${experienceId}`)
        .expect(401);
    });
  });

  // ── PUT /experience/batch ─────────────────────────────
  describe('PUT /experience/batch', () => {
    it('should batch update experiences', async () => {
      const res = await request(app.getHttpServer())
        .put('/experience/batch')
        .set('Cookie', `token=${authToken}`)
        .send({
          experiences: [
            { data: createExperienceData() },
            {
              data: createExperienceData({
                title: 'Product Manager',
                company: 'BigCo',
              }),
            },
          ],
          deleteIds: [],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put('/experience/batch')
        .send({ experiences: [], deleteIds: [] })
        .expect(401);
    });

    it(`should reject batch with more than ${VALIDATION_LIMITS.BATCH.EXPERIENCES_MAX} experiences`, async () => {
      const tooMany = Array.from(
        { length: VALIDATION_LIMITS.BATCH.EXPERIENCES_MAX + 1 },
        (_, i) => ({
          data: createExperienceData({
            title: `Batch exp ${i}`,
            company: `Batch company ${i}`,
          }),
        }),
      );

      await request(app.getHttpServer())
        .put('/experience/batch')
        .set('Cookie', `token=${authToken}`)
        .send({ experiences: tooMany, deleteIds: [] })
        .expect(400);
    });
  });
});
