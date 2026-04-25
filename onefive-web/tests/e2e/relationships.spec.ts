import { test, expect } from './fixtures';

/**
 * /relationships is currently a "Coming Soon" placeholder page.
 * We assert the placeholder renders without JS errors.
 */
test.describe('Relationships', () => {
  test('coming soon placeholder loads cleanly', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/relationships', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(errs).toEqual([]);
    await expect(
      page.locator('h1:has-text("Gestion des relations"), :text("Coming Soon")').first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
