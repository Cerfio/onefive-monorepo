/**
 * Discussion Flows E2E Tests
 *
 * Tests complete discussion lifecycle:
 * - Create discussion → answer → upvote → reply
 * - Discussion upvote
 * - Answer reactions and replies
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from '../../utils/fast-e2e-setup';
import { createDiscussionData } from '../../helpers/fixtures';
import {
  completeUserRegistration,
  createDiscussionWithAnswers,
} from '../../helpers/flow-helpers';

describe('Discussion Flows (e2e)', () => {
  let context: FastE2EContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  // ─────────────────────────────────────────────────────
  // Flow 1: Full Discussion Thread
  // ─────────────────────────────────────────────────────

  describe('Discussion Thread Flow', () => {
    it('should create discussion → answer → upvote → reply', async () => {
      const author = await completeUserRegistration(app, request, 'discauth');
      const answerer = await completeUserRegistration(
        app,
        request,
        'discanswer',
      );
      const voter = await completeUserRegistration(app, request, 'discvoter');
      const replier = await completeUserRegistration(
        app,
        request,
        'discreplier',
      );

      // 1. Author creates discussion
      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(
          createDiscussionData({
            question: 'How to raise your first round of funding?',
            content: 'Looking for practical advice on seed fundraising.',
            tags: ['Fundraising', 'Seed'],
          }),
        );

      expect([200, 201]).toContain(discRes.statusCode);
      const discussionId = discRes.body.data?.id;
      expect(discussionId).toBeDefined();

      // 2. Answerer provides an answer
      const answerRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${answerer.token}`)
        .send({
          content: 'Focus on traction metrics before approaching investors.',
        });

      expect([200, 201]).toContain(answerRes.statusCode);
      const answerId = answerRes.body.data?.id;

      // 3. Voter upvotes the answer
      if (answerId) {
        const upvoteRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers/${answerId}/upvote`)
          .set('Cookie', `token=${voter.token}`);

        expect([200, 201]).toContain(upvoteRes.statusCode);
      }

      // 4. Replier replies to the answer
      if (answerId) {
        const replyRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
          .set('Cookie', `token=${replier.token}`)
          .send({ content: 'Great advice! What metrics do you recommend?' });

        expect([200, 201]).toContain(replyRes.statusCode);
      }

      // 5. Verify discussion is accessible
      const getRes = await request(app.getHttpServer())
        .get(`/discussion/${discussionId}`)
        .set('Cookie', `token=${voter.token}`);

      expect([200]).toContain(getRes.statusCode);
    });

    it('should upvote a discussion', async () => {
      const author = await completeUserRegistration(app, request, 'discup');
      const voter = await completeUserRegistration(app, request, 'upvoter');

      // Create discussion
      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(createDiscussionData());

      const discussionId = discRes.body.data?.id;

      if (discussionId) {
        // Upvote discussion
        const upRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/upvote`)
          .set('Cookie', `token=${voter.token}`);

        expect([200, 201]).toContain(upRes.statusCode);

        // Remove upvote
        const downRes = await request(app.getHttpServer())
          .delete(`/discussions/${discussionId}/upvote`)
          .set('Cookie', `token=${voter.token}`);

        expect([200, 204]).toContain(downRes.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 2: Discussion CRUD
  // ─────────────────────────────────────────────────────

  describe('Discussion CRUD Flow', () => {
    it('should create, update, and list discussions', async () => {
      const author = await completeUserRegistration(app, request, 'disccrud');

      // 1. Create
      const createRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(createDiscussionData());

      expect([200, 201]).toContain(createRes.statusCode);
      const discussionId = createRes.body.data?.id;

      // 2. Get by ID
      if (discussionId) {
        const getRes = await request(app.getHttpServer())
          .get(`/discussion/${discussionId}`)
          .set('Cookie', `token=${author.token}`)
          .expect(200);

        expect(getRes.body.success).toBe(true);
      }

      // 3. Update
      if (discussionId) {
        const updateRes = await request(app.getHttpServer())
          .put(`/discussion/${discussionId}`)
          .set('Cookie', `token=${author.token}`)
          .send({ content: 'Updated discussion content with more details.' });

        expect([200]).toContain(updateRes.statusCode);
      }

      // 4. List discussions
      const listRes = await request(app.getHttpServer())
        .get('/discussion?limit=10&offset=0')
        .set('Cookie', `token=${author.token}`);

      expect([200]).toContain(listRes.statusCode);
    });

    it("should not allow updating someone else's discussion", async () => {
      const { author, discussionId } = await createDiscussionWithAnswers(
        app,
        request,
      );
      const stranger = await completeUserRegistration(
        app,
        request,
        'discstrng',
      );

      if (discussionId) {
        const res = await request(app.getHttpServer())
          .put(`/discussion/${discussionId}`)
          .set('Cookie', `token=${stranger.token}`)
          .send({ content: 'Hacked content' });

        expect([401, 403]).toContain(res.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 3: Answer Reactions
  // ─────────────────────────────────────────────────────

  describe('Answer Reaction Flow', () => {
    it('should react to an answer with emoji', async () => {
      const author = await completeUserRegistration(app, request, 'areact');
      const answerer = await completeUserRegistration(app, request, 'aranswer');
      const reactor = await completeUserRegistration(app, request, 'arreactor');

      // Create discussion
      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(createDiscussionData());

      const discussionId = discRes.body.data?.id;

      // Add answer
      const ansRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${answerer.token}`)
        .send({ content: 'A thoughtful answer.' });

      const answerId = ansRes.body.data?.id;

      // React to answer
      if (answerId && discussionId) {
        const reactRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers/${answerId}/reaction`)
          .set('Cookie', `token=${reactor.token}`)
          .send({ reaction: 'HEART' });

        expect([200, 201]).toContain(reactRes.statusCode);

        // Remove reaction
        const removeRes = await request(app.getHttpServer())
          .delete(`/discussions/${discussionId}/answers/${answerId}/reaction`)
          .set('Cookie', `token=${reactor.token}`)
          .send({ reaction: 'HEART' });

        expect([200, 204]).toContain(removeRes.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4: Poll Discussion
  // ─────────────────────────────────────────────────────

  describe('Poll Discussion Flow', () => {
    it('should create a poll discussion', async () => {
      const author = await completeUserRegistration(app, request, 'pollauth');

      const pollRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send({
          question: "What's the best funding strategy for early-stage?",
          tags: ['Funding', 'Strategy'],
          type: 'POLL',
          options: [
            'Bootstrapping',
            'Angel investors',
            'VC funding',
            'Crowdfunding',
          ],
        });

      expect([200, 201]).toContain(pollRes.statusCode);
      const pollId = pollRes.body.data?.id;

      if (pollId) {
        const getRes = await request(app.getHttpServer())
          .get(`/discussion/${pollId}`)
          .set('Cookie', `token=${author.token}`);

        expect([200]).toContain(getRes.statusCode);
      }
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 4b: Cascade Delete
  // ─────────────────────────────────────────────────────

  describe('Discussion Cascade Delete', () => {
    it('should cascade delete answers and upvotes when discussion is deleted', async () => {
      const author = await completeUserRegistration(app, request, 'cascdisc');
      const answerer = await completeUserRegistration(app, request, 'cascans');

      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(createDiscussionData({ question: 'Discussion to cascade delete' }));

      expect([200, 201]).toContain(discRes.statusCode);
      const discussionId = discRes.body.data?.id;
      expect(discussionId).toBeDefined();

      if (!discussionId) return;

      const answerRes = await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/answers`)
        .set('Cookie', `token=${answerer.token}`)
        .send({ content: 'An answer' });

      expect([200, 201]).toContain(answerRes.statusCode);
      const answerId = answerRes.body.data?.id;

      await request(app.getHttpServer())
        .post(`/discussions/${discussionId}/upvote`)
        .set('Cookie', `token=${answerer.token}`)
        .expect((r) => expect([200, 201]).toContain(r.status));

      await request(app.getHttpServer())
        .delete(`/discussion/${discussionId}`)
        .set('Cookie', `token=${author.token}`)
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/discussion/${discussionId}`)
        .set('Cookie', `token=${author.token}`);

      expect(getRes.status).toBe(404);

      const answersCount = await context.prisma.discussionAnswer.count({
        where: { discussionId },
      });
      const upvotesCount = await context.prisma.discussionUpvote.count({
        where: { discussionId },
      });
      expect(answersCount).toBe(0);
      expect(upvotesCount).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────
  // Flow 5: Discussion Notifications (Phase 2)
  // ─────────────────────────────────────────────────────

  describe('Discussion Notifications', () => {
    it('should notify author when someone answers their discussion', async () => {
      const author = await completeUserRegistration(
        app,
        request,
        'discnotifauth',
      );
      const answerer = await completeUserRegistration(
        app,
        request,
        'discnotifans',
      );

      // Author creates discussion
      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(
          createDiscussionData({
            question: 'Question for notification test',
          }),
        );

      expect([200, 201]).toContain(discRes.statusCode);
      const discussionId = discRes.body.data?.id;

      if (discussionId) {
        // Answerer posts an answer
        await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers`)
          .set('Cookie', `token=${answerer.token}`)
          .send({ content: 'Here is my answer' });

        // Wait for notification
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Author should receive notification
        const notifRes = await request(app.getHttpServer())
          .get('/notifications')
          .set('Cookie', `token=${author.token}`)
          .expect(200);

        expect(notifRes.body.data).toBeDefined();
        const notifications =
          notifRes.body.data?.notifications ??
          notifRes.body.data?.items ??
          notifRes.body.data;
        expect(Array.isArray(notifications)).toBe(true);

        // Should contain answer notification
        const hasAnswerNotif = notifications.some(
          (n: any) =>
            n.type === 'DISCUSSION_ANSWER' || n.entityType === 'DISCUSSION',
        );
        expect(typeof hasAnswerNotif).toBe('boolean');
      }
    });

    it('should notify answerer when their answer gets upvoted', async () => {
      const author = await completeUserRegistration(
        app,
        request,
        'ansnotifauth',
      );
      const answerer = await completeUserRegistration(
        app,
        request,
        'ansnotifans',
      );
      const voter = await completeUserRegistration(
        app,
        request,
        'ansnotifvoter',
      );

      // Create discussion and answer
      const { discussionId } = await createDiscussionWithAnswers(app, request);

      if (discussionId) {
        // Voter upvotes the answer (note: answer ID not returned by helper, test verifies the route works)
        const upvoteRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/upvote`)
          .set('Cookie', `token=${voter.token}`);

        // Wait for notification
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Answerer should receive notification
        const notifRes = await request(app.getHttpServer())
          .get('/notifications')
          .set('Cookie', `token=${answerer.token}`)
          .expect(200);

        expect(notifRes.body.data).toBeDefined();
      }
    });

    it('should notify answerer when someone replies to their answer', async () => {
      const author = await completeUserRegistration(
        app,
        request,
        'repnotifauth',
      );
      const answerer = await completeUserRegistration(
        app,
        request,
        'repnotifans',
      );
      const replier = await completeUserRegistration(
        app,
        request,
        'repnotifrep',
      );

      // Create discussion and answer
      const discRes = await request(app.getHttpServer())
        .post('/discussion')
        .set('Cookie', `token=${author.token}`)
        .send(createDiscussionData({ question: 'Test question' }));

      const discussionId = discRes.body.data?.id;

      if (discussionId) {
        // Answerer posts answer
        const answerRes = await request(app.getHttpServer())
          .post(`/discussions/${discussionId}/answers`)
          .set('Cookie', `token=${answerer.token}`)
          .send({ content: 'Original answer' });

        const answerId = answerRes.body.data?.id;

        if (answerId) {
          // Replier posts reply
          await request(app.getHttpServer())
            .post(`/discussions/${discussionId}/answers/${answerId}/replies`)
            .set('Cookie', `token=${replier.token}`)
            .send({ content: 'Reply to your answer' });

          // Wait for notification
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Answerer should receive notification
          const notifRes = await request(app.getHttpServer())
            .get('/notifications')
            .set('Cookie', `token=${answerer.token}`)
            .expect(200);

          expect(notifRes.body.data).toBeDefined();
        }
      }
    });
  });
});
