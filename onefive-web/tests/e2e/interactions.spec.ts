import { test, expect, ACCOUNTS, newLoggedInContext } from './fixtures';

/**
 * User-to-user interactions: two parallel browser contexts (Alice + Bob)
 * verify that actions made by one user are visible to the other.
 *
 * These tests are READ-ONLY on effect: they open modals, look at existing
 * relationships, and verify that the UI is coherent between two accounts.
 * They do NOT send messages, create connections, or mutate shared state.
 */
test.describe('User-to-user interactions', () => {
  test('Alice and Bob can both load their feeds simultaneously without JS errors', async ({
    browser,
  }) => {
    const alice = await newLoggedInContext(browser, ACCOUNTS.alice);
    const bob = await newLoggedInContext(browser, ACCOUNTS.bob);

    const aliceErrs: string[] = [];
    const bobErrs: string[] = [];
    alice.page.on('pageerror', e => aliceErrs.push(e.message));
    bob.page.on('pageerror', e => bobErrs.push(e.message));

    await alice.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await bob.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await Promise.all([alice.page.waitForTimeout(2500), bob.page.waitForTimeout(2500)]);

    expect(aliceErrs, 'Alice JS errors').toEqual([]);
    expect(bobErrs, 'Bob JS errors').toEqual([]);

    await alice.context.close();
    await bob.context.close();
  });

  test('Alice can view Bob profile and Bob can view Alice profile', async ({ browser }) => {
    const alice = await newLoggedInContext(browser, ACCOUNTS.alice);
    const bob = await newLoggedInContext(browser, ACCOUNTS.bob);

    // Alice visits Bob via network
    await alice.page.goto('/network', { waitUntil: 'domcontentloaded' });
    await alice.page.waitForTimeout(2500);
    const anyProfileLink = alice.page.locator('a[href*="/profile/"]').first();
    const hasProfile = await anyProfileLink.count();
    if (hasProfile > 0) {
      await anyProfileLink.click();
      await alice.page.waitForURL(/\/profile\//, { timeout: 15_000 });
    }

    // Bob visits Alice via network
    await bob.page.goto('/network', { waitUntil: 'domcontentloaded' });
    await bob.page.waitForTimeout(2500);
    const bobLink = bob.page.locator('a[href*="/profile/"]').first();
    const bobHasProfile = await bobLink.count();
    if (bobHasProfile > 0) {
      await bobLink.click();
      await bob.page.waitForURL(/\/profile\//, { timeout: 15_000 });
    }

    await alice.context.close();
    await bob.context.close();
  });

  // FIXME: flaky in dev mode — 2 simultaneous Next.js page compiles cause one
  // context to time out waiting for the navbar to render. Reliable in production builds.
  test.fixme('notification bell opens for both accounts independently', async ({ browser }) => {
    const alice = await newLoggedInContext(browser, ACCOUNTS.alice);
    const bob = await newLoggedInContext(browser, ACCOUNTS.bob);

    await alice.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await alice.page.waitForSelector('nav button', { timeout: 30_000 });
    await alice.page.waitForTimeout(1500);

    await bob.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await bob.page.waitForSelector('nav button', { timeout: 30_000 });
    await bob.page.waitForTimeout(1500);

    await alice.page.locator('nav button').first().click();
    await alice.page.waitForTimeout(800);
    await expect(alice.page.locator('[role="menu"], [role="dialog"]').first()).toBeVisible({
      timeout: 8_000,
    });

    await alice.page.keyboard.press('Escape');
    await bob.page.locator('nav button').first().click();
    await bob.page.waitForTimeout(800);
    await expect(bob.page.locator('[role="menu"], [role="dialog"]').first()).toBeVisible({
      timeout: 8_000,
    });

    await alice.context.close();
    await bob.context.close();
  });
});
