import { test, expect } from './fixtures';

test.describe('Discussions', () => {
  test('create discussion modal opens', async ({ loggedInPage: page }) => {
    await page.goto('/discussions');
    await page.waitForTimeout(2000);
    const createBtn = page
      .locator('button:has-text("Créer"), button:has-text("Nouvelle"), button:has-text("Poser")')
      .first();
    await createBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('publish button is disabled when title is empty (regression — isDisabled prop fix)', async ({
    loggedInPage: page,
  }) => {
    await page.goto('/discussions');
    await page.waitForTimeout(2000);
    await page
      .locator('button:has-text("Créer"), button:has-text("Nouvelle"), button:has-text("Poser")')
      .first()
      .click();
    await page.waitForTimeout(1000);
    const publishBtn = page.locator('[role="dialog"] button:has-text("Publier")').first();
    await expect(publishBtn).toBeVisible();
    const isInert = await publishBtn.evaluate(
      el =>
        el.hasAttribute('data-disabled') ||
        (el as HTMLButtonElement).disabled ||
        el.getAttribute('aria-disabled') === 'true',
    );
    expect(isInert).toBe(true);
  });
});
