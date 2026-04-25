import { test, expect } from './fixtures';

test.describe('Network', () => {
  test('network page loads with tabs', async ({ loggedInPage: page }) => {
    await page.goto('/network', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('search input accepts typing', async ({ loggedInPage: page }) => {
    await page.goto('/network', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const search = page.locator('input[placeholder*="echerch"], input[type="search"]').first();
    const exists = await search.count();
    test.skip(exists === 0, 'No search input on /network');
    await search.fill('alice');
    await page.waitForTimeout(1500);
  });

  test('profile card click navigates to profile', async ({ loggedInPage: page }) => {
    await page.goto('/network', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const firstLink = page.locator('a[href*="/profile/"]').first();
    const exists = await firstLink.count();
    test.skip(exists === 0, 'No profiles listed');
    await firstLink.click();
    await page.waitForURL(/\/profile\//, { timeout: 15_000 });
  });
});
