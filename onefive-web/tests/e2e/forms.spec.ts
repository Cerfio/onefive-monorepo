import { test, expect } from './fixtures';

test.describe('Form validation', () => {
  test('signin submit button is disabled when both fields empty', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="email"]', { timeout: 30_000 });
    const submit = page.locator('button[type="submit"]').first();
    await expect(submit).toBeVisible();
    const isInert = await submit.evaluate(
      el =>
        el.hasAttribute('data-disabled') ||
        (el as HTMLButtonElement).disabled ||
        el.getAttribute('aria-disabled') === 'true',
    );
    expect(isInert, 'Submit should be disabled with empty form').toBe(true);
  });

  test('signin submit becomes enabled once both fields filled', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="email"]', { timeout: 30_000 });
    await page.fill('input[name="email"]', 'fake@example.com');
    await page.fill('input[name="password"]', 'somePassword');
    await page.waitForTimeout(300);
    const submit = page.locator('button[type="submit"]').first();
    const isInert = await submit.evaluate(
      el =>
        el.hasAttribute('data-disabled') ||
        (el as HTMLButtonElement).disabled ||
        el.getAttribute('aria-disabled') === 'true',
    );
    expect(isInert, 'Submit should be enabled with both fields filled').toBe(false);
  });

  test('discussion modal disables Publish on too-short title', async ({ page }) => {
    const { login } = await import('./fixtures');
    await login(page);
    await page.goto('/discussions', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const btn = page
      .locator('button:has-text("Créer"), button:has-text("Nouvelle"), button:has-text("Poser")')
      .first();
    await btn.click();
    await page.waitForTimeout(1200);
    const titleInput = page
      .locator('[role="dialog"] input[name="title"], [role="dialog"] input')
      .first();
    await titleInput.fill('hi');
    await page.waitForTimeout(400);
    const publishBtn = page.locator('[role="dialog"] button:has-text("Publier")').first();
    const isInert = await publishBtn.evaluate(
      el =>
        el.hasAttribute('data-disabled') ||
        (el as HTMLButtonElement).disabled ||
        el.getAttribute('aria-disabled') === 'true',
    );
    expect(isInert, 'Publish should be disabled with 2-char title').toBe(true);
  });
});
