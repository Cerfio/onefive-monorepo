import { test as base, expect, Page, BrowserContext, Browser } from '@playwright/test';
import path from 'node:path';

export type TestAccount = { email: string; password: string; label: string };

export const ACCOUNTS = {
  team: { email: 'team@onefive.fr', password: '12345', label: 'team' },
  alice: { email: 'alice@onefive.fr', password: '12345', label: 'alice' },
  bob: { email: 'bob@onefive.fr', password: '12345', label: 'bob' },
  onboarding: { email: 'onboarding@onefive.fr', password: '12345', label: 'onboarding' },
} as const satisfies Record<string, TestAccount>;

export const DEFAULT_ACCOUNT: TestAccount = ACCOUNTS.team;

const STATE_DIR = path.join(__dirname, '.auth');

export function storageStatePath(account: TestAccount): string {
  return path.join(STATE_DIR, `${account.label}.json`);
}

/** Manual login flow — only used in auth.spec.ts and forms.spec.ts. */
export async function login(page: Page, account: TestAccount = DEFAULT_ACCOUNT): Promise<void> {
  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]', { timeout: 30_000 });
  await page.fill('input[name="email"]', account.email);
  await page.fill('input[name="password"]', account.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(feed|onboarding|waitlist)/, { timeout: 60_000 });
  await page.waitForTimeout(1500);
}

/** Open a logged-in browser context using a saved storage state file. */
export async function newLoggedInContext(
  browser: Browser,
  account: TestAccount,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: storageStatePath(account),
  });
  const page = await context.newPage();
  return { context, page };
}

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    // For the "team" project, the storageState is already applied via config.
    await use(page);
  },
});

export { expect };
