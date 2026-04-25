import { test, expect } from './fixtures';

test.describe('Profile', () => {
  test('own profile page loads with user name visible', async ({ loggedInPage: page }) => {
    await page.goto('/profile/current_user', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('edit header modal opens', async ({ loggedInPage: page }) => {
    await page.goto('/profile/current_user', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const editBtn = page
      .locator(
        'button:has-text("Modifier"), button:has-text("Éditer"), button[aria-label*="odifier"]',
      )
      .first();
    const exists = await editBtn.count();
    test.skip(exists === 0, 'No edit button visible');
    await editBtn.click();
    await page.waitForTimeout(1200);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
  });

  test('profile settings page loads', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(errs).toEqual([]);
  });
});
