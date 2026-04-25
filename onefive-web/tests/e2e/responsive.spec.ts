import { test, expect } from './fixtures';

test.describe('Responsive (mobile 375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile feed loads without overflow', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(errs).toEqual([]);
    const hasHorizScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizScroll, 'Page should not scroll horizontally on mobile').toBe(false);
  });

  test('mobile dataroom loads', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(errs).toEqual([]);
  });

  test('mobile messages page loads', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(errs).toEqual([]);
  });

  test('mobile profile page loads', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/profile/current_user', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(errs).toEqual([]);
  });
});
