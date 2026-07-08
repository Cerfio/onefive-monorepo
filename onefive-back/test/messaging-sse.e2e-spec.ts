/**
 * Messagerie temps réel end-to-end via SSE (Server-Sent Events), avec un vrai
 * client HTTP streaming (pas de gateway mocké).
 *
 * Scénarios :
 * 1. Un user ouvre 2 tabs (2 streams SSE) → les DEUX reçoivent message:new
 *    quand quelqu'un envoie un message. (L'ancien gateway Socket.IO ne tracait
 *    que le dernier socket par profileId — le hub SSE corrige ce bug via un
 *    Set<Subject> par profileId.)
 * 2. L'émetteur ne reçoit PAS son propre message (exclusion profileId).
 * 3. Fermer un tab n'affecte pas l'autre : le tab restant continue de recevoir.
 *
 * Le SSE est lu via fetch() + ReadableStream (Node 24), aucun package externe.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmailService } from '../src/email/email.service';
import { TwilioService } from '../src/twilio/twilio.service';
import { DiscordWebhookService } from '../src/discord/discord-webhook.service';
import { PostHogService } from '../src/posthog/posthog.service';
import {
  setupFastE2E,
  FastE2EContext,
  safeCleanup,
} from './utils/fast-e2e-setup';
import { createAuthenticatedUser } from './helpers/fixtures';

interface SseEvent {
  type: string;
  data: unknown;
}

/**
 * Client SSE minimal basé sur fetch() streaming.
 * Collecte les events reçus et permet d'attendre un type précis.
 */
class SseClient {
  private readonly received: SseEvent[] = [];
  private readonly waiters: Array<{
    type: string;
    resolve: (e: SseEvent) => void;
  }> = [];
  private readonly controller = new AbortController();
  private closed = false;

  private constructor() {}

  static async connect(url: string, token: string): Promise<SseClient> {
    const client = new SseClient();
    const res = await fetch(url, {
      headers: { cookie: `token=${token}`, accept: 'text/event-stream' },
      signal: client.controller.signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`SSE connect failed: ${res.status}`);
    }
    // Lecture du stream en tâche de fond.
    void client.pump(res.body);
    return client;
  }

  private async pump(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (!this.closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Les frames SSE sont séparés par une ligne vide (\n\n).
        let sep: number;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          this.handleFrame(frame);
        }
      }
    } catch {
      // Abort ou fin de stream : rien à faire.
    } finally {
      reader.releaseLock();
    }
  }

  private handleFrame(frame: string) {
    let type = 'message';
    const dataLines: string[] = [];
    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) type = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length === 0) return;

    const raw = dataLines.join('\n');
    let data: unknown = raw;
    try {
      data = JSON.parse(raw);
    } catch {
      // garder la string brute
    }

    const event: SseEvent = { type, data };
    this.received.push(event);

    const idx = this.waiters.findIndex((w) => w.type === type);
    if (idx !== -1) {
      const [waiter] = this.waiters.splice(idx, 1);
      waiter.resolve(event);
    }
  }

  waitFor(type: string, timeoutMs = 2500): Promise<SseEvent> {
    const existing = this.received.find((e) => e.type === type);
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Timed out waiting for SSE "${type}"`)),
        timeoutMs,
      );
      this.waiters.push({
        type,
        resolve: (e) => {
          clearTimeout(timer);
          resolve(e);
        },
      });
    });
  }

  hasReceived(type: string): boolean {
    return this.received.some((e) => e.type === type);
  }

  close() {
    this.closed = true;
    this.controller.abort();
  }
}

describe('Messaging SSE multi-tab real client', () => {
  let context: FastE2EContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    context = await setupFastE2E();
    app = context.app;
    prisma = context.prisma;
    baseUrl = context.baseUrl;

    // Mocks externes uniquement — surtout pas le hub de messagerie.
    jest.spyOn(app.get(EmailService), 'sendEmail').mockResolvedValue({
      mocked: true,
      accepted: true,
      to: '',
      type: '',
    } as any);
    jest.spyOn(app.get(TwilioService), 'sendSms').mockResolvedValue('SM_mock');
    jest
      .spyOn(app.get(DiscordWebhookService), 'send')
      .mockResolvedValue(undefined);
    jest.spyOn(app.get(PostHogService), 'capture').mockImplementation(() => {});
  });

  afterAll(async () => {
    await safeCleanup(context);
  });

  const sseUrl = () => `${baseUrl}/messaging/events`;

  it('both tabs of the same user receive message:new (SSE fan-out)', async () => {
    const alice = await createAuthenticatedUser(app, request, 'sse-alice');
    const bob = await createAuthenticatedUser(app, request, 'sse-bob');

    const convRes = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${alice.token}`)
      .send({ participantIds: [bob.profileId], type: 'DIRECT' });
    expect([200, 201]).toContain(convRes.status);
    const conversationId = convRes.body.data.id as string;

    // Bob ouvre 2 tabs (2 streams SSE avec le même cookie)
    const bobTab1 = await SseClient.connect(sseUrl(), bob.token);
    const bobTab2 = await SseClient.connect(sseUrl(), bob.token);

    try {
      // Laisser les streams s'établir.
      await new Promise((r) => setTimeout(r, 200));

      const tab1Msg = bobTab1.waitFor('message:new');
      const tab2Msg = bobTab2.waitFor('message:new');

      // Alice envoie un message via REST → le hub broadcast aux 2 tabs de Bob.
      await request(app.getHttpServer())
        .post('/messaging/messages')
        .set('Cookie', `token=${alice.token}`)
        .send({ conversationId, content: 'multi-tab hello', type: 'TEXT' })
        .expect((r) => {
          if (![200, 201].includes(r.status)) throw new Error(`send ${r.status}`);
        });

      const [e1, e2] = await Promise.all([tab1Msg, tab2Msg]);
      // Le payload embarque conversationId + le message.
      expect((e1.data as any).conversationId).toBe(conversationId);
      expect((e2.data as any).conversationId).toBe(conversationId);
    } finally {
      bobTab1.close();
      bobTab2.close();
    }
  });

  it('sender does NOT receive their own message:new', async () => {
    const sender = await createAuthenticatedUser(app, request, 'sse-sender');
    const other = await createAuthenticatedUser(app, request, 'sse-other');

    const convRes = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${sender.token}`)
      .send({ participantIds: [other.profileId], type: 'DIRECT' });
    const conversationId = convRes.body.data.id as string;

    const senderStream = await SseClient.connect(sseUrl(), sender.token);

    try {
      await new Promise((r) => setTimeout(r, 200));

      await request(app.getHttpServer())
        .post('/messaging/messages')
        .set('Cookie', `token=${sender.token}`)
        .send({ conversationId, content: 'ping', type: 'TEXT' })
        .expect((r) => {
          if (![200, 201].includes(r.status)) throw new Error(`send ${r.status}`);
        });

      // Laisser le temps à un éventuel broadcast mal dirigé d'arriver.
      await new Promise((r) => setTimeout(r, 500));

      expect(senderStream.hasReceived('message:new')).toBe(false);
    } finally {
      senderStream.close();
    }
  });

  it('closing one tab does not stop the other from receiving', async () => {
    const alice = await createAuthenticatedUser(app, request, 'sse-disc-a');
    const bob = await createAuthenticatedUser(app, request, 'sse-disc-b');

    const convRes = await request(app.getHttpServer())
      .post('/messaging/conversations')
      .set('Cookie', `token=${alice.token}`)
      .send({ participantIds: [bob.profileId], type: 'DIRECT' });
    const conversationId = convRes.body.data.id as string;

    const bobTab1 = await SseClient.connect(sseUrl(), bob.token);
    const bobTab2 = await SseClient.connect(sseUrl(), bob.token);

    try {
      await new Promise((r) => setTimeout(r, 200));

      // Fermer le tab 1.
      bobTab1.close();
      await new Promise((r) => setTimeout(r, 100));

      const tab2Msg = bobTab2.waitFor('message:new');

      await request(app.getHttpServer())
        .post('/messaging/messages')
        .set('Cookie', `token=${alice.token}`)
        .send({ conversationId, content: 'still here?', type: 'TEXT' })
        .expect((r) => {
          if (![200, 201].includes(r.status)) throw new Error(`send ${r.status}`);
        });

      const event = await tab2Msg;
      expect((event.data as any).conversationId).toBe(conversationId);
    } finally {
      bobTab2.close();
    }
  });
});
