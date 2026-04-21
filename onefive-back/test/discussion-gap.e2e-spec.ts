/**
 * Gap check — les handlers Discussion ne semblent pas appeler notificationHelper.
 * Ce test affirme le comportement ATTENDU (notification à l'auteur de la discussion
 * quand quelqu'un y répond). S'il échoue, c'est qu'il faut câbler
 * `notifyDiscussionAnswer` dans NotificationHelperService et dans le handler.
 *
 * TODO(launch): cabler la notif — voir docs/QA_SIDE_EFFECTS_MATRIX.md §2.3
 * Si ce test passe, supprimer ce commentaire et mettre à jour la matrice.
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
import { installMocks, ExternalCallMocks, resetMocks } from './helpers/mocks';
import { notificationsFor, waitForNotifications } from './helpers/assertions';

describe('Discussion notifications — gap check', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => resetMocks(mocks));

  async function createDiscussion(token: string) {
    const res = await request(app.getHttpServer())
      .post('/discussion')
      .set('Cookie', `token=${token}`)
      .send({
        question: 'How should we structure our seed round?',
        content: 'Looking for advice on valuation and investor selection.',
        tags: ['fundraising'],
        type: 'DISCUSSION',
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`discussion create ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    return res.body.data.id as string;
  }

  async function answerDiscussion(token: string, discussionId: string) {
    const res = await request(app.getHttpServer())
      .post(`/discussions/${discussionId}/answers`)
      .set('Cookie', `token=${token}`)
      .send({ content: 'Here is my take on it.' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`answer create ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    return res.body.data.id as string;
  }

  it('discussion author is notified (COMMENT type, DISCUSSION entityType) when someone answers', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-author');
    const responder = await createAuthenticatedUser(app, request, 'disc-responder');

    const discussionId = await createDiscussion(author.token);
    const answerId = await answerDiscussion(responder.token, discussionId);

    // Fire-and-forget in the handler — poll until it lands.
    const notifs = await waitForNotifications(
      prisma,
      author.profileId,
      'COMMENT',
      1,
    );

    expect(notifs.length).toBeGreaterThanOrEqual(1);
    const matched = notifs.filter(
      (n: any) => n.entityType === 'DISCUSSION' && n.entityId === discussionId,
    );
    expect(matched).toHaveLength(1);
    expect(matched[0].actorId).toBe(responder.profileId);
    expect((matched[0].data as any)?.answerId).toBe(answerId);
  });

  it('self-answer does NOT notify (author answering their own discussion)', async () => {
    const author = await createAuthenticatedUser(app, request, 'self-answer');
    const discussionId = await createDiscussion(author.token);

    await answerDiscussion(author.token, discussionId);

    await new Promise((r) => setTimeout(r, 200)); // small wait for async no-op

    const notifs = await notificationsFor(prisma, author.profileId, 'COMMENT');
    const forThisDiscussion = notifs.filter(
      (n: any) => n.entityType === 'DISCUSSION' && n.entityId === discussionId,
    );
    expect(forThisDiscussion).toHaveLength(0);
  });

  it('baseline: discussion + answer creation do not trigger emails/SMS themselves', async () => {
    const author = await createAuthenticatedUser(app, request, 'disc-author-b');
    const responder = await createAuthenticatedUser(app, request, 'disc-responder-b');

    // Reset AFTER user creation (signup/profile emits email-verification emails)
    resetMocks(mocks);

    const discussionId = await createDiscussion(author.token);
    const answerId = await answerDiscussion(responder.token, discussionId);

    expect(discussionId).toBeTruthy();
    expect(answerId).toBeTruthy();

    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.sms).not.toHaveBeenCalled();
  });
});
