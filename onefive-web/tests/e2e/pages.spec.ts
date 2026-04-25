import { test, expect } from './fixtures';

const PROTECTED_PAGES = [
  '/feed',
  '/network',
  '/messages',
  '/discussions',
  '/dataroom',
  '/relationships',
  '/notifications',
  '/spotlight',
  '/my-investments',
  '/settings',
  '/analytics',
  '/profile/current_user',
];

test.describe('Pages load without JS errors', () => {
  for (const path of PROTECTED_PAGES) {
    test(`${path} loads`, async ({ loggedInPage: page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      expect(pageErrors, `Uncaught JS errors on ${path}`).toEqual([]);
    });
  }
});
