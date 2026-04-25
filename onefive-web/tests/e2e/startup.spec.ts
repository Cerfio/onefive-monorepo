import { test, expect } from './fixtures';

test.describe('Startup', () => {
  test('startup public page loads for a seeded startup', async ({ loggedInPage: page }) => {
    await page.goto('/network', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    // Try to find a startup tab or a startup link
    const startupTab = page.locator('[role="tab"]:has-text("Startup")').first();
    if (await startupTab.count()) {
      await startupTab.click();
      await page.waitForTimeout(1500);
    }
    const startupLink = page.locator('a[href*="/startup/"]').first();
    const exists = await startupLink.count();
    test.skip(exists === 0, 'No startups listed');
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await startupLink.click();
    await page.waitForURL(/\/startup\//, { timeout: 15_000 });
    await page.waitForTimeout(3000);
    expect(errs).toEqual([]);
  });
});
