import { test, expect } from './fixtures';

const PAGES = ['/analytics', '/spotlight', '/my-investments', '/settings'];

test.describe('Misc pages render without JS error', () => {
  for (const path of PAGES) {
    test(`${path} loads`, async ({ loggedInPage: page }) => {
      const errs: string[] = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);
      expect(errs, `JS errors on ${path}`).toEqual([]);
      const h = page.locator('h1, h2').first();
      await expect(h).toBeVisible({ timeout: 5000 });
    });
  }
});
