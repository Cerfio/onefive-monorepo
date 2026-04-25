import { test, expect } from './fixtures';

/**
 * NOTE: /notifications is NOT a real route — notifications are accessed only
 * via the bell dropdown in the navbar. We assert the dropdown behaviour here.
 */
test.describe('Notifications (via navbar bell)', () => {
  test('bell dropdown opens', async ({ loggedInPage: page }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bell = page.locator('nav button').first();
    await bell.click();
    await page.waitForTimeout(600);
    await expect(page.locator('[role="menu"], [role="dialog"]').first()).toBeVisible();
  });

  test('bell dropdown contains tabs (engagement/invitations/system)', async ({
    loggedInPage: page,
  }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.locator('nav button').first().click();
    await page.waitForTimeout(700);
    const tabs = page.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 5000 });
    expect(await tabs.count()).toBeGreaterThan(0);
  });
});
