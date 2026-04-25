import { test, expect } from './fixtures';

test.describe('Feed', () => {
  test('create post modal opens from trigger', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(2500);
    const trigger = page
      .locator(
        'input[placeholder*="crire"], [placeholder*="crire un post"], button:has-text("Écrire")',
      )
      .first();
    await trigger.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('post dots dropdown opens (Dropdown.DotsButton pattern)', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(2500);
    const dots = page.locator('button[aria-label="Open menu"]').first();
    const count = await dots.count();
    test.skip(count === 0, 'No posts on feed to exercise dots menu');
    await dots.click();
    await expect(page.locator('[role="menu"]').first()).toBeVisible();
  });

  test('post repost dropdown opens (regression — Dropdown.Trigger fix)', async ({
    loggedInPage: page,
  }) => {
    await page.goto('/feed');
    await page.waitForTimeout(2500);
    const repostBtn = page.locator('button:has(p:has-text("Repost"))').first();
    const count = await repostBtn.count();
    test.skip(count === 0, 'No posts with repost button');
    await repostBtn.click();
    await expect(page.locator('[role="menu"]').first()).toBeVisible();
  });
});
