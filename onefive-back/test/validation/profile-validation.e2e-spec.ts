import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../utils/fast-e2e-setup';
import { createAuthenticatedUser } from '../helpers/fixtures';
import { VALIDATION_LIMITS } from '../../src/common/constants/validation-limits.constants';

describe('Profile Validation E2E Tests', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let sessionCookie: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const user = await createAuthenticatedUser(app, request, 'profile-val');
    sessionCookie = `token=${user.token}`;

    await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', sessionCookie)
      .expect(200);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('accepts bio at exact max length', async () => {
    const maxBio = 'a'.repeat(VALIDATION_LIMITS.PROFILE.BIO_MAX);

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', sessionCookie)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        title: 'Engineer',
        bio: maxBio,
      });

    expect([200]).toContain(res.statusCode);
  });

  it('rejects bio exceeding max length', async () => {
    const tooLongBio = 'a'.repeat(VALIDATION_LIMITS.PROFILE.BIO_MAX + 1);

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', sessionCookie)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        title: 'Engineer',
        bio: tooLongBio,
      });

    expect(res.status).toBe(400);
  });

  it('accepts title at exact max length', async () => {
    const maxTitle = 'a'.repeat(VALIDATION_LIMITS.PROFILE.TITLE_MAX);

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', sessionCookie)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        title: maxTitle,
        bio: 'Short bio',
      });

    expect([200]).toContain(res.statusCode);
  });

  it('rejects title exceeding max length', async () => {
    const tooLongTitle = 'a'.repeat(
      VALIDATION_LIMITS.PROFILE.TITLE_MAX + 1,
    );

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', sessionCookie)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        title: tooLongTitle,
        bio: 'Short bio',
      });

    expect(res.status).toBe(400);
  });

  it('rejects firstName exceeding max length', async () => {
    const tooLong = 'a'.repeat(
      VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX + 1,
    );

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', sessionCookie)
      .send({
        firstName: tooLong,
        lastName: 'Doe',
        title: 'Engineer',
        bio: 'Short bio',
      });

    expect(res.status).toBe(400);
  });
});
