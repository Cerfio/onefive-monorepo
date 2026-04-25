import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

setup.describe.configure({ timeout: 360_000 });

const STATE_DIR = path.join(__dirname, '.auth');
fs.mkdirSync(STATE_DIR, { recursive: true });

const ACCOUNTS = {
  team: { email: 'team@onefive.fr', password: '12345', file: 'team.json' },
  alice: { email: 'alice@onefive.fr', password: '12345', file: 'alice.json' },
  bob: { email: 'bob@onefive.fr', password: '12345', file: 'bob.json' },
};

/** Cold-compile every page the suite touches so per-test goto's don't time out. */
const ROUTES_TO_WARM = [
  '/signin',
  '/signup',
];
const PROTECTED_ROUTES_TO_WARM = [
  '/feed',
  '/network',
  '/notifications',
  '/relationships',
  '/analytics',
  '/settings',
  '/spotlight',
  '/my-investments',
  '/discussions',
  '/dataroom',
  '/messages',
  '/profile/current_user',
];

setup('warm-up public routes', async ({ page }) => {
  for (const route of ROUTES_TO_WARM) {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 120_000 }).catch(() => {});
    await page.waitForTimeout(500);
  }
});

for (const [name, acc] of Object.entries(ACCOUNTS)) {
  setup(`authenticate as ${name}`, async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('input[name="email"]', { timeout: 30_000 });
    await page.fill('input[name="email"]', acc.email);
    await page.fill('input[name="password"]', acc.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|onboarding|waitlist)/, { timeout: 60_000 });
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/\/(feed|onboarding|waitlist)/);
    await page.context().storageState({ path: path.join(STATE_DIR, acc.file) });
  });
}

setup('warm-up protected routes (using team session)', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: path.join(STATE_DIR, 'team.json'),
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  for (const route of PROTECTED_ROUTES_TO_WARM) {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 120_000 }).catch(() => {});
    await page.waitForTimeout(800);
  }
  await context.close();
});
