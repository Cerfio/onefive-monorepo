/**
 * Test minimal pour débugger l'auth dans les tests E2E
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../utils/fast-e2e-setup';

describe('DEBUG Auth (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('should signup and get a valid token', async () => {
    const email = `debug-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Signup
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password });

    console.log('Signup response:', {
      status: signupRes.statusCode,
      body: signupRes.body,
    });

    expect([200, 201]).toContain(signupRes.statusCode);
    expect(signupRes.body.data.token).toBeDefined();

    const token = signupRes.body.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);

    // Test: POST /profile (la requête qui échoue)
    const profileData = {
      city: 'Paris',
      countryCode: 'FR',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      firstName: 'Debug',
      lastName: 'User',
      gender: 'male',
      genderSalutationPreference: 0,
      ecosystemRoles: ['FOUNDER'],
    };

    console.log('Attempting to create profile...');
    const profileRes = await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${token}`)
      .send(profileData);

    console.log('Profile creation response:', {
      status: profileRes.statusCode,
      body: profileRes.body,
      headers: profileRes.headers,
    });

    // Si 401, essayons de comprendre pourquoi
    if (profileRes.statusCode === 401) {
      console.error('❌ Got 401 Unauthorized on profile creation');
      console.log('Sent cookie:', `token=${token.substring(0, 20)}...`);

      // Test: vérifier que le sessionGuard fonctionne avec un autre endpoint
      const settingsRes = await request(app.getHttpServer())
        .get('/user-settings')
        .set('Cookie', `token=${token}`);

      console.log('User settings response:', {
        status: settingsRes.statusCode,
        body: settingsRes.body,
      });
    }

    expect([200, 201]).toContain(profileRes.statusCode);
  });
});
