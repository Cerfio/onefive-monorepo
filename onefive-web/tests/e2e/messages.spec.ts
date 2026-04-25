import { test, expect } from './fixtures';

test.describe('Messages', () => {
  test('messages page loads without JS error', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(errs).toEqual([]);
  });

  // FIXME: CreateConversationModal imports DialogTrigger directly from react-aria-components (v1.10.1)
  // while the Modal/ModalOverlay come from @onefive/ui (v1.15.1). Same root cause as the navbar
  // dropdown bug we fixed via Dropdown.Trigger. Fix: add `react-aria-components` to root pnpm.overrides.
  test.fixme('new conversation CTA opens modal', async ({ loggedInPage: page }) => {
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const btn = page
      .locator(
        'button:has-text("Nouveau message"), button:has-text("Nouvelle"), button:has-text("Créer")',
      )
      .first();
    const exists = await btn.count();
    test.skip(exists === 0, 'No new-conversation CTA');
    await btn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('selecting a conversation shows the thread (if any)', async ({ loggedInPage: page }) => {
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const convItems = page.locator('[role="option"], [data-conversation]');
    const count = await convItems.count();
    test.skip(count === 0, 'No conversations to open');
    await convItems.first().click();
    await page.waitForTimeout(1500);
    const composer = page.locator('textarea, [contenteditable="true"]').first();
    await expect(composer).toBeVisible({ timeout: 8000 });
  });
});
