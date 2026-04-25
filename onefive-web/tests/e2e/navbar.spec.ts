import { test, expect } from './fixtures';

test.describe('Navbar', () => {
  test('avatar dropdown opens on click (regression — react-aria version mismatch bug)', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(1500);
    const avatarButton = page.locator('nav button').nth(1);
    await avatarButton.click();
    await page.waitForTimeout(600);
    const menuVisible = page.locator('[role="menu"]').first();
    await expect(menuVisible).toBeVisible();
  });

  test('avatar dropdown menu items are clickable and navigate', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(2000);
    await page.locator('nav button').nth(1).click();
    await page.waitForTimeout(700);
    const item = page.locator('[role="menuitem"], [role="menuitemradio"]:has-text("Paramètres")').first();
    await expect(item).toBeVisible({ timeout: 5_000 });
    await item.click();
    await page.waitForURL(/\/settings/, { timeout: 60_000 });
  });

  test('notification bell opens dropdown', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(1500);
    const bell = page.locator('nav button').first();
    await bell.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="menu"], [role="dialog"]').first()).toBeVisible();
  });

  test('search input accepts typing and shows suggestions', async ({ loggedInPage: page }) => {
    await page.goto('/feed');
    await page.waitForTimeout(1500);
    const search = page.locator('input[placeholder*="echerch"], input[type="search"]').first();
    await search.fill('yannis');
    await page.waitForTimeout(2500);
    const suggestions = page.locator('[role="listbox"], [role="option"]').first();
    await expect(suggestions).toBeVisible({ timeout: 5000 });
  });
});
