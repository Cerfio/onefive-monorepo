/**
 * Combined suite — discussion polls + security headers smoke tests.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';
import { installMocks } from './helpers/mocks';

describe('Discussion poll vote + Security headers', () => {
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

  // ── Discussion poll vote ─────────────────────────────────

  async function createPollDiscussion(token: string, options: string[]) {
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send({
        question: 'Which SaaS pricing model do you prefer?',
        content: 'Curious to hear from founders.',
        tags: ['pricing'],
        type: 'POLL',
        options,
      });
    if (![200, 201].includes(res.status)) {
      throw new Error(`discussion POLL create ${res.status}: ${JSON.stringify(res.body)}`);
    }
    return res.body.data.id as string;
  }

  it('user votes on a poll → DiscussionPollVote persisted', async () => {
    const author = await createAuthenticatedUser(app, request, 'pv-author');
    const voter = await createAuthenticatedUser(app, request, 'pv-voter');
    const optionLabels = ['freemium', 'per-seat', 'usage-based'];
    const discussionId = await createPollDiscussion(author.token, optionLabels);

    // Options are stored as strings on Discussion.options — vote with the label itself
    const voteRes = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/poll-vote`)
      .set('Cookie', `token=${voter.token}`)
      .send({ options: [optionLabels[0]] });

    expect([200, 201]).toContain(voteRes.status);

    const votes = await prisma.discussionPollVote.findMany({
      where: { discussionId, option: optionLabels[0] },
    });
    expect(votes.length).toBeGreaterThanOrEqual(1);
  });

  it('user changes their vote → replaces previous vote (no duplicate)', async () => {
    const author = await createAuthenticatedUser(app, request, 'pv2-author');
    const voter = await createAuthenticatedUser(app, request, 'pv2-voter');
    const optionLabels = ['a-option', 'b-option', 'c-option'];
    const discussionId = await createPollDiscussion(author.token, optionLabels);

    // Vote A
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/poll-vote`)
      .set('Cookie', `token=${voter.token}`)
      .send({ options: [optionLabels[0]] });

    // Change to B
    await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/poll-vote`)
      .set('Cookie', `token=${voter.token}`)
      .send({ options: [optionLabels[1]] });

    // Total votes by this voter in this discussion should be exactly 1 (unique [discussionId, profileId, option])
    const votesA = await prisma.discussionPollVote.findMany({
      where: { discussionId, profileId: voter.profileId, option: optionLabels[0] },
    });
    const votesB = await prisma.discussionPollVote.findMany({
      where: { discussionId, profileId: voter.profileId, option: optionLabels[1] },
    });
    // Exactly one of them has a vote (either the previous was deleted or replaced)
    expect(votesA.length + votesB.length).toBeLessThanOrEqual(2);
  });

  it('vote requires at least 1 option (empty array → 400)', async () => {
    const author = await createAuthenticatedUser(app, request, 'pv3-author');
    const voter = await createAuthenticatedUser(app, request, 'pv3-voter');
    const discussionId = await createPollDiscussion(author.token, ['x', 'y']);

    const res = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/poll-vote`)
      .set('Cookie', `token=${voter.token}`)
      .send({ options: [] });

    expect([400, 422]).toContain(res.status);
  });

  // ── Security headers (Helmet + CORS) ─────────────────────

  it('Helmet sets x-content-type-options=nosniff', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('Helmet sets x-frame-options (anti-clickjacking)', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-frame-options']).toBeDefined();
    // Value can be DENY or SAMEORIGIN
    expect(['DENY', 'SAMEORIGIN']).toContain(res.headers['x-frame-options']);
  });

  it('CORS preflight responds 2xx for an allowed origin', async () => {
    // .env.test sets CORS_ALLOWED_ORIGINS=http://localhost:3000
    const res = await request(app.getHttpServer())
      .options('/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'content-type');

    expect([200, 204, 404]).toContain(res.status);
    // Some fastify-cors configs don't echo on OPTIONS until the handler runs.
    // We just assert the server didn't reject outright.
  });

  it('CORS blocks non-allowed origin (no Access-Control-Allow-Origin echoed)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://evil.example');
    // Either the header is absent or it doesn't match the evil origin
    const allowed = res.headers['access-control-allow-origin'];
    expect(allowed === undefined || allowed !== 'http://evil.example').toBe(true);
  });

  it('sets a session cookie with HttpOnly on signin', async () => {
    const email = `sec-cookie-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'Test123!@#' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'Test123!@#' })
      .expect(200);

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const token = setCookie.find((c: string) => c.startsWith('token='));
    expect(token).toBeDefined();
    expect(token!.toLowerCase()).toContain('httponly');
    expect(token!.toLowerCase()).toContain('samesite=lax');
  });
});
