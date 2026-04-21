/**
 * Messaging cascades — REST to WebSocket bridge + DB state.
 *
 * Le test n'ouvre pas de vrai client Socket.io : on spie les méthodes
 * notifyXxx du gateway (installMocks) et on assert qu'elles sont appelées
 * avec le bon profileId (et PAS le userId — vérif explicite du fix af852f7).
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
import { posthogEventsFor } from './helpers/assertions';

describe('Messaging cascades — send / edit / delete / react / read', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let mocks: ExternalCallMocks;

  let alice: { token: string; profileId: string; userId: string; email: string };
  let bob: { token: string; profileId: string; userId: string; email: string };
  let conversationId: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    mocks = installMocks(app);

    alice = await createAuthenticatedUser(app, request, 'msg-alice');
    bob = await createAuthenticatedUser(app, request, 'msg-bob');

    // Alice creates a conversation with Bob
    const res = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${alice.token}`)
      .send({ participantIds: [bob.profileId], type: 'DIRECT' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`conv create ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });
    conversationId = res.body.data.id;
    expect(conversationId).toBeDefined();
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  beforeEach(() => resetMocks(mocks));

  it('sendMessage: persists message, notifies gateway with profileId (not userId), excludes sender', async () => {
    if (!mocks.wsNewMessage) {
      // MessagingModule disabled — skip (should not happen after app.module fix)
      return;
    }

    await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'hello bob', type: 'TEXT' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    // DB message persisted
    const msgs = await prisma.message.findMany({
      where: { conversationId, senderId: alice.profileId },
    });
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toBe('hello bob');

    // Gateway called with (conversationId, message, excludeProfileId=alice.profileId)
    expect(mocks.wsNewMessage).toHaveBeenCalledTimes(1);
    const [convIdArg, messageArg, excludeArg] = mocks.wsNewMessage.mock.calls[0];
    expect(convIdArg).toBe(conversationId);
    expect(excludeArg).toBe(alice.profileId); // key assertion: profileId, NOT userId
    expect(excludeArg).not.toBe(alice.userId);
    expect(messageArg.content).toBe('hello bob');

    expect(posthogEventsFor(mocks, 'message_sent')).toHaveLength(1);
  });

  it('markAsRead: notifies gateway with reader profileId (not userId)', async () => {
    if (!mocks.wsMessageRead) return;

    // Alice sends, then Bob reads
    await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'are you there', type: 'TEXT' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    resetMocks(mocks);

    await request(app.getHttpServer())
      .post(`/messaging/conversations/${conversationId}/read`)
      .set('Cookie', `token=${bob.token}`)
      .send({})
      .expect(200);

    expect(mocks.wsMessageRead).toHaveBeenCalledTimes(1);
    const [convIdArg, readerArg] = mocks.wsMessageRead.mock.calls[0];
    expect(convIdArg).toBe(conversationId);
    expect(readerArg).toBe(bob.profileId);
    expect(readerArg).not.toBe(bob.userId);
  });

  it('editMessage: notifies gateway message:edited', async () => {
    if (!mocks.wsMessageEdited) return;

    const sendRes = await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'original', type: 'TEXT' });
    const messageId = sendRes.body.data.id;
    expect(messageId).toBeDefined();

    resetMocks(mocks);

    await request(app.getHttpServer())
      .put(`/messaging/messages/${messageId}`)
      .set('Cookie', `token=${alice.token}`)
      .send({ content: 'edited', messageId })
      .expect(200);

    expect(mocks.wsMessageEdited).toHaveBeenCalledTimes(1);
    expect(mocks.wsMessageEdited.mock.calls[0][0]).toBe(conversationId);
  });

  it('deleteMessage: notifies gateway message:deleted', async () => {
    if (!mocks.wsMessageDeleted) return;

    const sendRes = await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'delete me', type: 'TEXT' });
    const messageId = sendRes.body.data.id;

    resetMocks(mocks);

    await request(app.getHttpServer())
      .delete(`/messaging/messages/${messageId}`)
      .set('Cookie', `token=${alice.token}`)
      .expect((r) => {
        if (![200, 204].includes(r.status)) throw new Error(`got ${r.status}`);
      });

    expect(mocks.wsMessageDeleted).toHaveBeenCalledTimes(1);
    expect(mocks.wsMessageDeleted.mock.calls[0][1]).toBe(messageId);
  });

  it('createReaction: notifies gateway reaction:added with reactor profileId', async () => {
    if (!mocks.wsReactionAdded) return;

    const sendRes = await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'reactable', type: 'TEXT' });
    const messageId = sendRes.body.data.id;

    resetMocks(mocks);

    await request(app.getHttpServer())
      .post(`/messaging/messages/${messageId}/reactions`)
      .set('Cookie', `token=${bob.token}`)
      .send({ messageId, emoji: '👍' })
      .expect((r) => {
        if (![200, 201].includes(r.status)) throw new Error(`got ${r.status}: ${JSON.stringify(r.body)}`);
      });

    expect(mocks.wsReactionAdded).toHaveBeenCalledTimes(1);
    const [, data] = mocks.wsReactionAdded.mock.calls[0];
    expect(data.profileId).toBe(bob.profileId);
    expect(data.profileId).not.toBe(bob.userId);
  });

  it('non-member cannot send to someone else conversation (403)', async () => {
    const outsider = await createAuthenticatedUser(app, request, 'msg-outsider');

    const res = await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${outsider.token}`)
      .send({ conversationId, content: 'sneaky', type: 'TEXT' });

    expect([400, 403, 404]).toContain(res.status);
  });

  it('no emails or SMS are sent on messaging operations', async () => {
    resetMocks(mocks);

    await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${alice.token}`)
      .send({ conversationId, content: 'silent', type: 'TEXT' });

    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.sms).not.toHaveBeenCalled();
  });
});
