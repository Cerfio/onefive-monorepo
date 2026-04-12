import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  validPassword,
  createUniqueEmail,
  createProfileData,
  approveProfileInWaitlist,
} from '../../test/helpers/fixtures';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from 'test/utils/fast-e2e-setup';

describe('ProfileSuggestionController (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let authToken: string;
  let profileId2: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;

    const email1 = createUniqueEmail('psug');
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: email1, password: validPassword })
      .expect(201);
    authToken = signupRes.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${authToken}`)
      .send(createProfileData())
      .expect(201);

    await approveProfileInWaitlist(app, email1);

    // Create second user to follow
    const email2 = createUniqueEmail('psug2');
    const signup2 = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: email2, password: validPassword })
      .expect(201);
    const token2 = signup2.body.data.token;

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${token2}`)
      .send(createProfileData({ firstName: 'Suggested' }))
      .expect(201);

    await approveProfileInWaitlist(app, email2);

    const self2 = await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${token2}`)
      .expect(200);
    profileId2 = self2.body.data.id;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  describe('GET /profile-suggestion', () => {
    it('should get profile suggestions', async () => {
      const res = await request(app.getHttpServer())
        .get('/profile-suggestion')
        .set('Cookie', `token=${authToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/profile-suggestion').expect(401);
    });
  });

  describe('POST /profile-suggestion/follow/:profileId', () => {
    it('should follow a suggested profile', async () => {
      const res = await request(app.getHttpServer())
        .post(`/profile-suggestion/follow/${profileId2}`)
        .set('Cookie', `token=${authToken}`)
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('following');
    });
  });
});
