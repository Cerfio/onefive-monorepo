import { test, expect, login, DEFAULT_ACCOUNT } from './fixtures';

test.describe('Auth', () => {
  test('signin page renders form fields', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with valid credentials redirects to feed/onboarding', async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/\/(feed|onboarding|waitlist)/);
  });

  test('signup page renders form fields without submitting', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('bad password keeps user on signin', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', DEFAULT_ACCOUNT.email);
    await page.fill('input[name="password"]', 'wrong-password-abc');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    expect(page.url()).toContain('/signin');
  });
});
