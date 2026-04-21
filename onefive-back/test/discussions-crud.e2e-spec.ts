/**
 * Discussions + answers + reactions/upvotes — CRUD smoke + IDOR + validation.
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

describe('Discussions CRUD + IDOR + validation', () => {
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

  async function createDiscussion(token: string, overrides: Record<string, unknown> = {}) {
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send({
        question: 'How should we handle X?',
        content: 'Some context',
        tags: ['x'],
        type: 'DISCUSSION',
        ...overrides,
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`got ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    return res.body.data.id as string;
  }

  it('GET /discussion (list) returns the created discussion', async () => {
    const u = await createAuthenticatedUser(app, request, 'disc-list');
    const id = await createDiscussion(u.token);

    const res = await request(app.getHttpServer())
      .get('/discussion')
      .set('Cookie', `token=${u.token}`)
      .expect(200);

    const items: any[] = res.body.data?.items ?? res.body.data ?? [];
    expect(items.find((d: any) => d.id === id)).toBeTruthy();
  });

  it('GET /discussion/:id returns the discussion for any authenticated user', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-r-author');
    const reader = await createAuthenticatedUser(app, request, 'disc-r-reader');
    const id = await createDiscussion(author.token);

    const res = await request(app.getHttpServer())
      .get(`/discussion/${id}`)
      .set('Cookie', `token=${reader.token}`)
      .expect(200);
    expect(res.body.data.id).toBe(id);
  });

  it('PUT /discussion/:id by non-owner is rejected', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-idor-a');
    const attacker = await createAuthenticatedUser(app, request, 'disc-idor-b');
    const id = await createDiscussion(author.token);

    const res = await request(app.getHttpServer())
      .put(`/discussion/${id}`)
      .set('Cookie', `token=${attacker.token}`)
      .send({ question: 'pwned', content: 'pwned', tags: [], type: 'DISCUSSION' });

    expect([400, 403, 404]).toContain(res.status);
  });

  it('DELETE /discussion/:id by non-owner is rejected', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-del-a');
    const attacker = await createAuthenticatedUser(app, request, 'disc-del-b');
    const id = await createDiscussion(author.token);

    const res = await request(app.getHttpServer())
      .delete(`/discussion/${id}`)
      .set('Cookie', `token=${attacker.token}`);
    expect([400, 403, 404]).toContain(res.status);

    const remaining = await prisma.discussion.findUnique({ where: { id } });
    expect(remaining).not.toBeNull();
  });

  it('owner can DELETE own discussion', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-own-del');
    const id = await createDiscussion(author.token);

    await request(app.getHttpServer())
      .delete(`/discussion/${id}`)
      .set('Cookie', `token=${author.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });

  it('validation: question too short → 400', async () => {
    const u = await createAuthenticatedUser(app, request, 'disc-val');
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${u.token}`)
      .send({ question: 'a', content: 'short', tags: [], type: 'DISCUSSION' });
    expect([400, 422]).toContain(res.status);
  });

  it('XSS sanitize: <script> in content is stripped', async () => {
    const u = await createAuthenticatedUser(app, request, 'disc-xss');
    const id = await createDiscussion(u.token, {
      content: 'innocent <script>alert("xss")</script> after',
    });

    const stored = await prisma.discussion.findUniqueOrThrow({ where: { id } });
    expect(stored.content || '').not.toMatch(/<script>/i);
  });

  it('answer creation: non-owner can answer (anyone can)', async () => {
    const author = await createAuthenticatedUser(app, request, 'a-owner');
    const responder = await createAuthenticatedUser(app, request, 'a-resp');
    const id = await createDiscussion(author.token);

    await request(app.getHttpServer())
      .post(`/discussions/${id}/answers`)
      .set('Cookie', `token=${responder.token}`)
      .send({ content: 'My answer here.' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
  });
});
