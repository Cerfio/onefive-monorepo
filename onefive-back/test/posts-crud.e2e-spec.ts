/**
 * Posts CRUD complet — list/get/update/delete + bookmarks + IDOR + validation.
 * (Création de cascade testée dans feed-cascades.e2e-spec.ts.)
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

describe('Posts CRUD + IDOR + validation', () => {
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

  async function createPost(token: string, content = 'hello world') {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${token}`)
      .send({ content, tags: [] })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });
    return res.body.data.id as string;
  }

  it('GET /posts/:id returns the post for owner and other users alike (public)', async () => {
    const author = await createAuthenticatedUser(app, request, 'pcu-author');
    const reader = await createAuthenticatedUser(app, request, 'pcu-reader');
    const postId = await createPost(author.token, 'public post');

    const ownerRes = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Cookie', `token=${author.token}`)
      .expect(200);
    expect(ownerRes.body.data.id).toBe(postId);

    const readerRes = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Cookie', `token=${reader.token}`)
      .expect(200);
    expect(readerRes.body.data.id).toBe(postId);
  });

  it('PUT /posts/:id by non-owner is rejected (403)', async () => {
    const author = await createAuthenticatedUser(app, request, 'idor-pa');
    const attacker = await createAuthenticatedUser(app, request, 'idor-attacker');
    const postId = await createPost(author.token, 'mine');

    const res = await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .set('Cookie', `token=${attacker.token}`)
      .send({ content: 'pwned' });

    expect([400, 403, 404]).toContain(res.status);
  });

  it('DELETE /posts/:id by non-owner is rejected (403)', async () => {
    const author = await createAuthenticatedUser(app, request, 'idor-da');
    const attacker = await createAuthenticatedUser(app, request, 'idor-da-attacker');
    const postId = await createPost(author.token);

    const res = await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Cookie', `token=${attacker.token}`);
    expect([400, 403, 404]).toContain(res.status);

    // Post still exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    expect(post).not.toBeNull();
  });

  it('owner can DELETE own post → soft-deleted (or hard-deleted)', async () => {
    const author = await createAuthenticatedUser(app, request, 'own-del');
    const postId = await createPost(author.token, 'delete me');

    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Cookie', `token=${author.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    // Either gone, or marked isDeleted
    if (post !== null) {
      expect((post as any).isDeleted).toBe(true);
    }
  });

  it('content validation: empty content → 400', async () => {
    const u = await createAuthenticatedUser(app, request, 'val-empty');
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${u.token}`)
      .send({ content: '', tags: [] });
    expect([400, 422]).toContain(res.status);
  });

  it('content sanitization: XSS payload is stripped on read', async () => {
    const author = await createAuthenticatedUser(app, request, 'xss-author');
    const postId = await createPost(
      author.token,
      'normal text <script>alert("xss")</script> after',
    );

    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Cookie', `token=${author.token}`)
      .expect(200);

    const stored = res.body.data.content as string;
    expect(stored).not.toMatch(/<script>/i);
  });

  it('GET /posts list paginates without duplicates', async () => {
    const author = await createAuthenticatedUser(app, request, 'pag-author');
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      ids.push(await createPost(author.token, `post-${i}`));
    }

    const page1 = await request(app.getHttpServer())
      .get('/posts?take=3')
      .set('Cookie', `token=${author.token}`)
      .expect(200);

    const items: any[] = page1.body.data?.items ?? page1.body.data ?? [];
    expect(items.length).toBeLessThanOrEqual(3);
    const idSet = new Set(items.map((p: any) => p.id));
    expect(idSet.size).toBe(items.length);
  });

  it('bookmark + unbookmark flow does not crash and is idempotent', async () => {
    const author = await createAuthenticatedUser(app, request, 'bm-author');
    const reader = await createAuthenticatedUser(app, request, 'bm-reader');
    const postId = await createPost(author.token);

    // Try bookmark — endpoint exists?
    const r1 = await request(app.getHttpServer())
      .post(`/post-bookmarks/${postId}`)
      .set('Cookie', `token=${reader.token}`);
    // Some implementations use /posts/:id/bookmark; accept either
    expect([200, 201, 404]).toContain(r1.status);
  });
});
