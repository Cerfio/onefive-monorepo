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

export type ExternalCallMocks = {
  email: jest.SpyInstance;
  sms: jest.SpyInstance;
  apifyProfile: jest.SpyInstance;
  apifyCompany: jest.SpyInstance;
  discord: jest.SpyInstance;
  posthog: jest.SpyInstance;
  linkedinExchange?: jest.SpyInstance;
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

  return { email, sms, apifyProfile, apifyCompany, discord, posthog, linkedinExchange };
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
