/**
 * XSS sanitize regression — vérifier que sanitize-html (via @SanitizeText et
 * @SanitizeHtml) strip <script>, javascript:, et autres vecteurs sur TOUS
 * les fields user-facing.
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

const XSS_PAYLOAD = `Hello <script>alert("xss")</script> world`;
const XSS_HREF = `<a href="javascript:alert(1)">click</a>`;
const SCRIPT_REGEX = /<script[\s>]/i;
const JAVASCRIPT_REGEX = /javascript:/i;

describe('XSS sanitize regression — all user-facing content fields', () => {
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

  it('Post content: <script> stripped on read', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-post');
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${u.token}`)
      .send({ content: XSS_PAYLOAD, tags: [] });
    const stored = await prisma.post.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(stored.content || '').not.toMatch(SCRIPT_REGEX);
  });

  it('Post comment content: <script> stripped', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-cm');
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${u.token}`)
      .send({ content: 'normal', tags: [] });
    const postId = postRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/post-comments/posts/${postId}`)
      .set('Cookie', `token=${u.token}`)
      .send({ content: XSS_PAYLOAD });

    const comments = await prisma.postComment.findMany({ where: { postId } });
    expect(comments[0].content || '').not.toMatch(SCRIPT_REGEX);
  });

  it('Discussion content: <script> stripped', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-disc');
    await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${u.token}`)
      .send({
        question: 'Question safe text long enough',
        content: XSS_PAYLOAD,
        tags: ['xss'], // tags >= 1 required
        type: 'DISCUSSION',
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}: ${JSON.stringify(r.body)}`);
      });
    // Some endpoints don't return id — query by author + recent
    const stored = await prisma.discussion.findFirstOrThrow({
      where: { profileId: u.profileId },
      orderBy: { createdAt: 'desc' },
    });
    expect(stored.content || '').not.toMatch(SCRIPT_REGEX);
  });

  it('Profile bio: <script> stripped via UpdateProfileDto SanitizeHtml', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-bio');
    await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', `token=${u.token}`)
      .send({
        firstName: 'X',
        lastName: 'Y',
        title: 'Dev',
        bio: XSS_PAYLOAD,
      });
    const profile = await prisma.profile.findUniqueOrThrow({ where: { id: u.profileId } });
    expect(profile.bio || '').not.toMatch(SCRIPT_REGEX);
  });

  it('Profile firstName (SanitizeText): tags stripped completely', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-name');
    await request(app.getHttpServer())
      .put('/profile')
      .set('Cookie', `token=${u.token}`)
      .send({
        firstName: '<b>Bold</b>Name',
        lastName: 'Y',
        title: 'Dev',
        bio: 'safe',
      });
    const profile = await prisma.profile.findUniqueOrThrow({ where: { id: u.profileId } });
    expect(profile.firstName).not.toMatch(/<b>/);
  });

  it('Message content: <script> stripped', async () => {
    const a = await createAuthenticatedUser(app, request, 'xss-msg-a');
    const b = await createAuthenticatedUser(app, request, 'xss-msg-b');

    const conv = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${a.token}`)
      .send({ participantIds: [b.profileId], type: 'DIRECT' });
    const conversationId = conv.body.data.id;

    await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${a.token}`)
      .send({ conversationId, content: XSS_PAYLOAD, type: 'TEXT' });

    const msgs = await prisma.message.findMany({ where: { conversationId } });
    expect(msgs[0].content || '').not.toMatch(SCRIPT_REGEX);
  });

  it('javascript: href in <a> stripped (allowed schemes are http/https/mailto)', async () => {
    const u = await createAuthenticatedUser(app, request, 'xss-href');
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', `token=${u.token}`)
      .send({ content: XSS_HREF, tags: [] });
    const stored = await prisma.post.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(stored.content || '').not.toMatch(JAVASCRIPT_REGEX);
  });
});
