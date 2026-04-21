/**
 * Test mocks for external services.
 *
 * Philosophy: we don't swap providers at module build time. We instantiate the
 * real NestJS app, then replace specific methods with `jest.spyOn(...)` so the
 * handler code sees a normal service but the side effect is captured.
 *
 * Why: `createApp()` (main.ts) is used by both prod and tests. Keeping the
 * module graph identical avoids divergent DI behaviour between the two.
 */
import type { INestApplication } from '@nestjs/common';
import { EmailService } from '../../src/email/email.service';
import { TwilioService } from '../../src/twilio/twilio.service';
import { ApifyService } from '../../src/linkedin-sync/apify.service';
import { DiscordWebhookService } from '../../src/discord/discord-webhook.service';
import { PostHogService } from '../../src/posthog/posthog.service';
import { LinkedinService } from '../../src/linkedin/linkedin.service';
import { MessagingGateway } from '../../src/messaging/messaging.gateway';
import { StorageService } from '../../src/storage/storage.service';
import { GoogleService } from '../../src/google/google.service';
import { OAuthStateService } from '../../src/auth/oauth-state/oauth-state.service';

export type ExternalCallMocks = {
  email: jest.SpyInstance;
  sms: jest.SpyInstance;
  apifyProfile: jest.SpyInstance;
  apifyCompany: jest.SpyInstance;
  discord: jest.SpyInstance;
  posthog: jest.SpyInstance;
  linkedinExchange?: jest.SpyInstance;
  wsNewMessage?: jest.SpyInstance;
  wsMessageRead?: jest.SpyInstance;
  wsMessageEdited?: jest.SpyInstance;
  wsMessageDeleted?: jest.SpyInstance;
  wsReactionAdded?: jest.SpyInstance;
  wsReactionRemoved?: jest.SpyInstance;
  storageUpload?: jest.SpyInstance;
  storageDelete?: jest.SpyInstance;
  storageSignedUrl?: jest.SpyInstance;
  googleAccessToken?: jest.SpyInstance;
  googleUserInfo?: jest.SpyInstance;
  linkedinAccessToken?: jest.SpyInstance;
  linkedinUserInfo?: jest.SpyInstance;
  oauthStateValidate?: jest.SpyInstance;
};

/**
 * Replace every outbound integration with a spy. Returns the spies so tests
 * can assert on them (e.g. `expect(mocks.email).toHaveBeenCalledWith(...)`).
 *
 * Call once in beforeAll, after `setupFastE2E()`. Call `resetMocks(mocks)`
 * in beforeEach if you want isolation between `it` blocks.
 */
export function installMocks(app: INestApplication): ExternalCallMocks {
  const emailService = app.get(EmailService);
  const email = jest
    .spyOn(emailService, 'sendEmail')
    .mockImplementation(async ({ to, type }) => ({
      mocked: true,
      accepted: true,
      to,
      type,
    }));

  const twilioService = app.get(TwilioService);
  const sms = jest
    .spyOn(twilioService, 'sendSms')
    .mockResolvedValue('SM_mock_sid');

  const apifyService = app.get(ApifyService);
  const apifyProfile = jest
    .spyOn(apifyService, 'scrapeLinkedInProfile')
    .mockResolvedValue(makeFakeLinkedInProfile());
  const apifyCompany = jest
    .spyOn(apifyService, 'scrapeLinkedInCompany')
    .mockResolvedValue(makeFakeLinkedInCompany());

  const discordService = app.get(DiscordWebhookService);
  const discord = jest
    .spyOn(discordService, 'send')
    .mockResolvedValue(undefined);

  const posthogService = app.get(PostHogService);
  const posthog = jest
    .spyOn(posthogService, 'capture')
    .mockImplementation(() => {});

  // LinkedinService is optional depending on module graph — guard it.
  let linkedinExchange: jest.SpyInstance | undefined;
  try {
    const linkedinService = app.get(LinkedinService, { strict: false });
    if (linkedinService && typeof (linkedinService as any).exchangeCodeForToken === 'function') {
      linkedinExchange = jest
        .spyOn(linkedinService as any, 'exchangeCodeForToken')
        .mockResolvedValue({ access_token: 'mock_access_token', expires_in: 3600 });
    }
  } catch {
    // Service not registered in this test context — skip.
  }

  // Messaging gateway WS emissions — spy without replacing so participant
  // tracking inside the gateway still works. Tests assert on .mock.calls.
  let wsNewMessage: jest.SpyInstance | undefined;
  let wsMessageRead: jest.SpyInstance | undefined;
  let wsMessageEdited: jest.SpyInstance | undefined;
  let wsMessageDeleted: jest.SpyInstance | undefined;
  let wsReactionAdded: jest.SpyInstance | undefined;
  let wsReactionRemoved: jest.SpyInstance | undefined;
  try {
    const gateway = app.get(MessagingGateway, { strict: false });
    if (gateway) {
      wsNewMessage = jest.spyOn(gateway, 'notifyNewMessage').mockResolvedValue(undefined);
      wsMessageRead = jest.spyOn(gateway, 'notifyMessageRead').mockResolvedValue(undefined);
      wsMessageEdited = jest.spyOn(gateway, 'notifyMessageEdited').mockResolvedValue(undefined);
      wsMessageDeleted = jest.spyOn(gateway, 'notifyMessageDeleted').mockResolvedValue(undefined);
      wsReactionAdded = jest.spyOn(gateway, 'notifyReactionAdded').mockResolvedValue(undefined);
      wsReactionRemoved = jest.spyOn(gateway, 'notifyReactionRemoved').mockResolvedValue(undefined);
    }
  } catch {
    // MessagingModule not registered (e.g. NODE_ENV=test skips it in app.module.ts)
  }

  // Storage (R2 / S3) — must never actually hit an S3 endpoint.
  let storageUpload: jest.SpyInstance | undefined;
  let storageDelete: jest.SpyInstance | undefined;
  let storageSignedUrl: jest.SpyInstance | undefined;
  try {
    const storage = app.get(StorageService, { strict: false });
    if (storage) {
      storageUpload = jest
        .spyOn(storage as any, 'uploadFile')
        .mockImplementation(async () => ({
          // DataroomFile.storageId is @unique — must return a fresh id each call
          id: `mock-file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          url: 'https://mock.local/file',
        }));
      storageDelete = jest
        .spyOn(storage as any, 'deleteFile')
        .mockResolvedValue(undefined);
      if (typeof (storage as any).getSignedUrl === 'function') {
        storageSignedUrl = jest
          .spyOn(storage as any, 'getSignedUrl')
          .mockResolvedValue('https://mock.local/signed');
      }
    }
  } catch {
    /* StorageModule might not be registered */
  }

  // Google OAuth — never hit the real accounts.google.com
  let googleAccessToken: jest.SpyInstance | undefined;
  let googleUserInfo: jest.SpyInstance | undefined;
  try {
    const google = app.get(GoogleService, { strict: false });
    if (google) {
      googleAccessToken = jest
        .spyOn(google as any, 'getAccessToken')
        .mockResolvedValue({
          access_token: 'mock_google_token',
          expires_in: 3600,
          scope: 'email profile',
          token_type: 'Bearer',
          id_token: 'mock_id_token',
        });
      googleUserInfo = jest
        .spyOn(google as any, 'getUserInfo')
        .mockImplementation(async () => ({
          id: `google-${Date.now()}`,
          email: `google-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
          verified_email: true,
          name: 'Mock User',
          given_name: 'Mock',
          family_name: 'User',
          picture: 'https://mock.local/avatar.png',
          locale: 'fr',
        }));
    }
  } catch {
    /* GoogleService unavailable */
  }

  // LinkedIn OAuth
  let linkedinAccessToken: jest.SpyInstance | undefined;
  let linkedinUserInfo: jest.SpyInstance | undefined;
  try {
    const linkedin = app.get(LinkedinService, { strict: false });
    if (linkedin) {
      if (typeof (linkedin as any).getAccessToken === 'function') {
        linkedinAccessToken = jest
          .spyOn(linkedin as any, 'getAccessToken')
          .mockResolvedValue({ access_token: 'mock_linkedin_token', expires_in: 3600 });
      }
      if (typeof (linkedin as any).getUserInfo === 'function') {
        linkedinUserInfo = jest
          .spyOn(linkedin as any, 'getUserInfo')
          .mockImplementation(async () => ({
            sub: `linkedin-${Date.now()}`,
            email: `linkedin-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
            email_verified: true,
            given_name: 'Mock',
            family_name: 'User',
            picture: 'https://mock.local/linkedin-avatar.png',
          }));
      }
    }
  } catch {
    /* LinkedinService unavailable */
  }

  // OAuthStateService — bypass CSRF state check (state value is fresh per request)
  let oauthStateValidate: jest.SpyInstance | undefined;
  try {
    const oauthState = app.get(OAuthStateService, { strict: false });
    if (oauthState) {
      oauthStateValidate = jest
        .spyOn(oauthState as any, 'validateState')
        .mockResolvedValue(true);
    }
  } catch {
    /* not registered */
  }

  return {
    email,
    sms,
    apifyProfile,
    apifyCompany,
    discord,
    posthog,
    linkedinExchange,
    wsNewMessage,
    wsMessageRead,
    wsMessageEdited,
    wsMessageDeleted,
    wsReactionAdded,
    wsReactionRemoved,
    storageUpload,
    storageDelete,
    storageSignedUrl,
    googleAccessToken,
    googleUserInfo,
    linkedinAccessToken,
    linkedinUserInfo,
    oauthStateValidate,
  };
}

export function resetMocks(mocks: ExternalCallMocks): void {
  for (const spy of Object.values(mocks)) {
    spy?.mockClear();
  }
}

export function restoreMocks(mocks: ExternalCallMocks): void {
  for (const spy of Object.values(mocks)) {
    spy?.mockRestore();
  }
}

// ── Fake external payloads ─────────────────────────────────

function makeFakeLinkedInProfile() {
  return {
    publicIdentifier: 'mock-user',
    linkedinUrl: 'https://www.linkedin.com/in/mock-user',
    firstName: 'Mock',
    lastName: 'User',
    headline: 'Mock Test Profile',
    summary: 'A fake linkedin profile for tests.',
    profilePicture: null,
    experiences: [],
    educations: [],
    skills: [],
  } as any;
}

function makeFakeLinkedInCompany() {
  return {
    id: 'mock-company-id',
    linkedinUrl: 'https://www.linkedin.com/company/mock-co',
    name: 'Mock Co',
    description: 'A fake linkedin company for tests.',
    tagline: null,
    industries: [],
    headquarters: null,
    website: null,
    logoUrl: null,
  } as any;
}
