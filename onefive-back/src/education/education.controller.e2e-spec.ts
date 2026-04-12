import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';
import {
  createAuthenticatedUser,
  createEducationData,
} from '../../test/helpers/fixtures';
import { VALIDATION_LIMITS } from '../common/constants/validation-limits.constants';

describe('EducationController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let token: string;
  let profileId: string;
  let educationId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'edu');
    token = user.token;
    profileId = user.profileId;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('POST /education', () => {
    it('should create an education entry', async () => {
      const res = await request(app.getHttpServer())
        .post('/education')
        .set('Cookie', `token=${token}`)
        .send(createEducationData())
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.school).toBe('University of Paris');
      expect(res.body.data.degree).toBe('Master');
      educationId = res.body.data.id;
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/education')
        .send(createEducationData())
        .expect(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/education')
        .set('Cookie', `token=${token}`)
        .send({ description: 'only optional fields' })
        .expect(400);

      expect(res.body.success).toBeFalsy();
    });

    it(`should reject creating more than ${VALIDATION_LIMITS.EDUCATION.MAX_EDUCATIONS_PER_PROFILE} educations`, async () => {
      const existingCount = await context.prisma.education.count({
        where: { profileId },
      });

      const remainingToMax = Math.max(
        0,
        VALIDATION_LIMITS.EDUCATION.MAX_EDUCATIONS_PER_PROFILE - existingCount,
      );

      for (let i = 0; i < remainingToMax; i += 1) {
        await request(app.getHttpServer())
          .post('/education')
          .set('Cookie', `token=${token}`)
          .send(
            createEducationData({
              school: `School ${i}`,
              degree: `Degree ${i}`,
            }),
          )
          .expect(201);
      }

      await request(app.getHttpServer())
        .post('/education')
        .set('Cookie', `token=${token}`)
        .send(
          createEducationData({
            school: 'Overflow School',
            degree: 'Overflow Degree',
          }),
        )
        .expect(400);
    });
  });

  describe('PUT /education/:educationId', () => {
    it('should update an education entry', async () => {
      expect(educationId).toBeDefined();

      const res = await request(app.getHttpServer())
        .put(`/education/${educationId}`)
        .set('Cookie', `token=${token}`)
        .send({ degree: 'PhD', school: 'MIT' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('DELETE /education/:educationId', () => {
    it('should delete an education entry', async () => {
      expect(educationId).toBeDefined();

      const res = await request(app.getHttpServer())
        .delete(`/education/${educationId}`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /education/batch', () => {
    it('should create multiple educations via batch', async () => {
      const res = await request(app.getHttpServer())
        .put('/education/batch')
        .set('Cookie', `token=${token}`)
        .send({
          educations: [
            { data: createEducationData({ school: 'Stanford University' }) },
            {
              data: createEducationData({
                school: 'Oxford University',
                degree: 'Bachelor',
              }),
            },
          ],
          deleteIds: [],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it(`should reject batch with more than ${VALIDATION_LIMITS.BATCH.EDUCATIONS_MAX} educations`, async () => {
      const tooMany = Array.from(
        { length: VALIDATION_LIMITS.BATCH.EDUCATIONS_MAX + 1 },
        (_, i) => ({
          data: createEducationData({
            school: `Batch school ${i}`,
            degree: `Batch degree ${i}`,
          }),
        }),
      );

      await request(app.getHttpServer())
        .put('/education/batch')
        .set('Cookie', `token=${token}`)
        .send({ educations: tooMany, deleteIds: [] })
        .expect(400);
    });
  });
});
