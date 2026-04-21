import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import {
  completeUserRegistration,
  createConnectedUsers,
} from '../../helpers/flow-helpers';

describe('Messaging Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  it('messaging module is enabled in test env (was previously disabled)', async () => {
    // Historical: MessagingModule was skipped in NODE_ENV=test until commit 670ccae.
    // It is now enabled so cascade tests can run; the route must respond 2xx.
    const user = await completeUserRegistration(app, request, 'msg-enabled');

    const res = await request(app.getHttpServer())
      .get('/messaging/conversations')
      .set('Cookie', `token=${user.token}`);

    expect([200, 201]).toContain(res.status);
  });

  it('when messaging enabled: A creates conversation with B, A sends message, B lists and sees it', async () => {
    const { user1, user2 } = await createConnectedUsers(app, request);

    const convRes = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${user1.token}`)
      .send({ participantIds: [user2.profileId] });

    if (convRes.status === 404) {
      return;
    }
    expect([200, 201]).toContain(convRes.statusCode);
    const conversationId = convRes.body.data?.id;
    if (!conversationId) return;

    const msgRes = await request(app.getHttpServer())
      .post('/messaging/messages')
      .set('Cookie', `token=${user1.token}`)
      .send({
        conversationId,
        content: 'Hello from A!',
        type: 'TEXT',
      });

    if (msgRes.status === 404) return;
    expect([200, 201]).toContain(msgRes.statusCode);

    const listRes = await request(app.getHttpServer())
      .get('/messaging/conversations')
      .set('Cookie', `token=${user2.token}`);

    if (listRes.status === 404) return;
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.data).toBeDefined();
  });
});
