import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import {
  createProfileData,
  createStartupData,
  createUniqueEmail,
  extractAuthTokenFromResponse,
  validPassword,
  createUserInWaitlist,
} from './helpers/fixtures';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication/Authorization Guards Refactor (E2E)', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('OTP-only session: blocks non-allowed endpoint with 403 and allows email endpoints', async () => {
    const email = createUniqueEmail('otp-only');

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: validPassword })
      .expect(201);

    const secondSignupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: validPassword })
      .expect(201);

    const otpOnlyToken = extractAuthTokenFromResponse(secondSignupRes);

    await request(app.getHttpServer())
      .get('/auth/email/has-been-verified')
      .set('Cookie', `token=${otpOnlyToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${otpOnlyToken}`)
      .expect(403);
  });

  it('Email not verified: blocks non-allowed endpoint with 403 and allows email endpoints', async () => {
    const email = createUniqueEmail('email-not-verified');
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: validPassword })
      .expect(201);

    const token = extractAuthTokenFromResponse(signupRes);

    const user = await prisma.user.findUnique({ where: { email } });
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: false },
    });

    await request(app.getHttpServer())
      .post('/auth/email/request')
      .set('Cookie', `token=${token}`)
      .expect((res) => {
        expect(res.status).not.toBe(403);
      });

    await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${token}`)
      .expect(403);
  });

  it('Onboarding not complete: blocks non-allowed endpoint with 403 and allows onboarding endpoints', async () => {
    const email = createUniqueEmail('onboarding');
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: validPassword })
      .expect(201);

    const token = extractAuthTokenFromResponse(signupRes);

    const user = await prisma.user.findUnique({ where: { email } });
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await request(app.getHttpServer())
      .post('/profile')
      .set('Cookie', `token=${token}`)
      .send(createProfileData())
      .expect(201);

    await prisma.profile.delete({ where: { userId: user.id } });

    await request(app.getHttpServer())
      .get('/profile/self')
      .set('Cookie', `token=${token}`)
      .expect(403);

    await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${token}`)
      .send(createStartupData())
      .expect(403);
  });

  it('Waitlist not active: blocks non-allowed endpoint with 403 and allows waitlist endpoints', async () => {
    const waitingUser = await createUserInWaitlist(
      app,
      request,
      'waiting-state',
    );

    await request(app.getHttpServer())
      .get('/waitlist/status')
      .set('Cookie', `token=${waitingUser.token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/startup')
      .set('Cookie', `token=${waitingUser.token}`)
      .send(createStartupData())
      .expect(403);
  });
});
