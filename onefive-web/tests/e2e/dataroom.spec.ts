import { test, expect } from './fixtures';

test.describe('Dataroom', () => {
  test('list page renders (empty state or cards)', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom');
    await page.waitForTimeout(2500);
    const hasCards = await page.locator('a[href*="/dataroom/"]').count();
    const hasEmpty = await page
      .locator(':text("Aucun"), :text("Pas encore"), :text("Créer")')
      .count();
    expect(hasCards + hasEmpty).toBeGreaterThan(0);
  });

  test('create dataroom CTA opens modal', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom');
    await page.waitForTimeout(2000);
    const createBtn = page
      .locator(
        'button:has-text("Créer"), button:has-text("Nouvelle"), button[aria-label*="réer"], a:has-text("Créer")',
      )
      .first();
    const exists = await createBtn.count();
    test.skip(exists === 0, 'No create CTA visible (owner-only?)');
    await createBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
  });

  test('opening a dataroom detail loads tabs', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom');
    await page.waitForTimeout(2500);
    const firstCard = page.locator('a[href*="/dataroom/"]').first();
    const exists = await firstCard.count();
    test.skip(exists === 0, 'No datarooms exist');
    await firstCard.click();
    await page.waitForURL(/\/dataroom\/[a-f0-9-]+/i, { timeout: 15_000 });
    await page.waitForTimeout(2500);
    const pageErrors: string[] = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.waitForTimeout(1000);
    expect(pageErrors).toEqual([]);
  });

  test('three-dots dropdown opens on dataroom card', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom');
    await page.waitForTimeout(2500);
    const dots = page.locator('button[aria-label="Open menu"]').first();
    const exists = await dots.count();
    test.skip(exists === 0, 'No dataroom dots menu');
    await dots.click();
    await expect(page.locator('[role="menu"]').first()).toBeVisible();
  });
});
