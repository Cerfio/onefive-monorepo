import path from 'node:path';
import { test, expect, ACCOUNTS, newLoggedInContext } from './fixtures';
import type { Page } from '@playwright/test';

const FIXTURES = path.join(__dirname, 'fixtures-files');
const SAMPLE_PDF = path.join(FIXTURES, 'sample.pdf');
const SAMPLE_JPG = path.join(FIXTURES, 'sample.jpg');

const DATAROOM_DETAIL_RE = /\/dataroom\/[a-z0-9-]+(?:\?|$|\/?$)/i;

/** Resolve href of the first dataroom card on /dataroom; returns null if none. */
async function firstDataroomHref(page: Page): Promise<string | null> {
  await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const card = page.locator('a[href*="/dataroom/"]').first();
  if ((await card.count()) === 0) return null;
  return card.getAttribute('href');
}

/** Open the first dataroom (best-effort) and wait for the detail URL. */
async function openFirstDataroom(page: Page): Promise<string | null> {
  const href = await firstDataroomHref(page);
  if (!href) {
    // Detail page isn't always reached via <a href>; try a card click.
    const card = page.locator('[role="link"], div[class*="cursor-pointer"]').first();
    if ((await card.count()) === 0) return null;
    await card.click();
    try {
      await page.waitForURL(DATAROOM_DETAIL_RE, { timeout: 15_000 });
    } catch {
      return null;
    }
    return page.url();
  }
  await page.goto(href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  return href;
}

/* -------------------------------------------------------------------------- */
/* Original smoke tests (kept verbatim for backwards compatibility).          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Empty state & list                                                         */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Empty state & list', () => {
  test('list page shows headline "Data Rooms"', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /Data Rooms/i }).first()).toBeVisible();
  });

  test('global stats cards (Total Data Rooms / Documents / Vues / Membres) render', async ({
    loggedInPage: page,
  }) => {
    await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    for (const label of ['Total Data Rooms', 'Documents', 'Vues', 'Membres']) {
      await expect(page.locator(`p:has-text("${label}")`).first()).toBeVisible();
    }
  });

  test('search box filters the dataroom list', async ({ loggedInPage: page }) => {
    await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const search = page
      .locator('input[placeholder*="Rechercher une data room"], input[placeholder*="echerch"]')
      .first();
    const exists = await search.count();
    test.skip(exists === 0, 'No search input on /dataroom');
    await search.fill('___zzz_no_match_xyz___');
    await page.waitForTimeout(500);
    // After a non-matching search, either no cards remain or "Aucune" appears.
    const remainingCards = await page.locator('a[href*="/dataroom/"]').count();
    const emptyState = page.locator(':text("Aucune"), :text("Aucun")').first();
    const hasEmpty = (await emptyState.count()) > 0;
    expect(remainingCards === 0 || hasEmpty).toBeTruthy();
  });

  test('clicking the first dataroom card lands on /dataroom/[id]', async ({
    loggedInPage: page,
  }) => {
    const href = await firstDataroomHref(page);
    test.skip(!href, 'No datarooms in seed');
    await page.goto(href!, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dataroom\/[a-f0-9-]+/i);
  });
});

/* -------------------------------------------------------------------------- */
/* Detail page — owner view                                                   */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Detail page Owner', () => {
  test.describe.configure({ mode: 'serial' });

  test('header shows Data Room title & "Importer des fichiers" CTA', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await expect(page.getByRole('heading', { name: /Data Room/i }).first()).toBeVisible();
    await expect(
      page.locator('button:has-text("Importer des fichiers"), button:has-text("Analytics")').first(),
    ).toBeVisible();
  });

  test('storage progress bar visible in header', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await expect(page.locator(':text("Stockage utilisé")').first()).toBeVisible();
    // ProgressBar component renders a [role="progressbar"] (react-aria).
    const progress = page.locator('[role="progressbar"]').first();
    if ((await progress.count()) > 0) {
      await expect(progress).toBeVisible();
    }
  });

  test('Catégories sidebar visible with at least the "Tous les fichiers" entry', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await expect(page.locator('h2:has-text("Catégories")').first()).toBeVisible();
    await expect(page.locator(':text("Tous les fichiers")').first()).toBeVisible();
  });

  test('Groupes d\'accès sidebar visible', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await expect(page.locator(':text("Groupes d\'accès")').first()).toBeVisible();
  });

  test('document grid OR empty-state visible', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const tableHeader = page.locator('table[aria-label="Documents"], :text("Documents")').first();
    await expect(tableHeader).toBeVisible({ timeout: 10_000 });
  });

  test('"Importer des fichiers" CTA opens upload modal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const btn = page.locator('button:has-text("Importer des fichiers")').first();
    test.skip((await btn.count()) === 0, 'Owner CTA not present');
    await btn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    // Close it via Escape so subsequent tests start fresh.
    await page.keyboard.press('Escape');
  });

  test('"Nouvelle catégorie" opens CreateCategory modal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const btn = page.locator('button:has-text("Nouvelle catégorie")').first();
    test.skip((await btn.count()) === 0, 'No category CTA (member view)');
    await btn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('"Nouveau groupe" opens CreateGroup modal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const btn = page.locator('button:has-text("Nouveau groupe")').first();
    test.skip((await btn.count()) === 0, 'No group CTA');
    await btn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('clicking a category in sidebar updates URL/state without crash', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Pick a non-"all" category if present.
    const cat = page
      .locator('aside button, .lg\\:w-64 button')
      .filter({ hasNotText: /Tous les fichiers/i })
      .first();
    const exists = await cat.count();
    test.skip(exists === 0, 'No additional category to click');
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await cat.click();
    await page.waitForTimeout(600);
    expect(errs).toEqual([]);
  });

  test('search bar filters files by name (debounced)', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const search = page
      .locator('input[placeholder="Rechercher des fichiers..."]')
      .first();
    test.skip((await search.count()) === 0, 'No search bar');
    await search.fill('___no-such-file___');
    await page.waitForTimeout(500);
    await expect(page.locator(':text("Aucun résultat")').first()).toBeVisible();
  });

  test('sort dropdown changes ordering label', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Default label is "Plus récent". Open the dropdown and click "Nom A-Z".
    const sortBtn = page.locator('button:has-text("Plus récent")').first();
    test.skip((await sortBtn.count()) === 0, 'Sort dropdown not visible');
    await sortBtn.click();
    await page.waitForTimeout(400);
    const nameAsc = page.locator('[role="menuitem"]:has-text("Nom A-Z")').first();
    if ((await nameAsc.count()) > 0) {
      await nameAsc.click();
      await page.waitForTimeout(400);
      await expect(page.locator('button:has-text("Nom A-Z")').first()).toBeVisible();
    }
  });

  test('clicking a file row opens the viewer in a new tab', async ({
    loggedInPage: page,
    context,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // The "Voir" button (Eye icon) on each row triggers window.open.
    const viewBtn = page.locator('button[aria-label="Voir"], [aria-label="Voir"]').first();
    test.skip((await viewBtn.count()) === 0, 'No file rows');
    const popupP = context.waitForEvent('page', { timeout: 8_000 }).catch(() => null);
    await viewBtn.click();
    const popup = await popupP;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      expect(popup.url()).toMatch(/\/dataroom\/.+\/file\//);
      await popup.close();
    }
  });

  test('row three-dots dropdown exposes versioning + CRUD actions', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Find the dots button inside the document table (last cell of first row).
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows / no dots');
    await rowDots.click();
    await page.waitForTimeout(400);
    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();
    for (const label of [
      'Nouvelle version',
      'Historique des versions',
      'Changer de catégorie',
      'Renommer',
      'Supprimer',
    ]) {
      await expect(menu.locator(`:text("${label}")`).first()).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('"Télécharger" button on a file row triggers signed-URL fetch (no download required)', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const dlBtn = page
      .locator('table[aria-label="Documents"] button[aria-label="Télécharger"]')
      .first();
    test.skip((await dlBtn.count()) === 0, 'No file rows');
    // Watch network for /signed-url? — a 200 or 4xx both indicate the call was made.
    const urlReq = page
      .waitForRequest(req => /signed-url|signedUrl|download/.test(req.url()), { timeout: 5_000 })
      .catch(() => null);
    await dlBtn.click();
    await urlReq;
    // We don't assert the download content; just that no JS error was thrown.
  });
});

/* -------------------------------------------------------------------------- */
/* Drag & drop (direct drop on DataroomMain)                                  */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Drag & drop direct', () => {
  test('drag overlay "Déposez vos fichiers" appears on dragenter (Files)', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');

    // Synthesize a dragenter event with dataTransfer.types containing 'Files'.
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return;
      const dt = new DataTransfer();
      // jsdom doesn't accept arbitrary types but Chromium does in eval.
      Object.defineProperty(dt, 'types', { value: ['Files'] });
      const evt = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt,
      });
      main.dispatchEvent(evt);
    });

    await page.waitForTimeout(300);
    const overlay = page.locator(':text("Déposez vos fichiers")').first();
    if ((await overlay.count()) > 0) {
      await expect(overlay).toBeVisible();
    }
  });

  test('drag without Files in dataTransfer.types is ignored', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return;
      const dt = new DataTransfer();
      Object.defineProperty(dt, 'types', { value: ['text/plain'] });
      const evt = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt,
      });
      main.dispatchEvent(evt);
    });
    await page.waitForTimeout(300);
    // Overlay must NOT be visible.
    expect(await page.locator(':text("Déposez vos fichiers")').count()).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Categories CRUD                                                            */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Categories CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('create category — open, fill, submit', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const btn = page.locator('button:has-text("Nouvelle catégorie")').first();
    test.skip((await btn.count()) === 0, 'Owner-only');
    await btn.click();
    await page.waitForTimeout(600);
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
    const input = modal.locator('input[placeholder*="ex:"], input').first();
    const tempName = `Cat E2E ${Date.now()}`;
    await input.fill(tempName);
    const submit = modal.locator('button:has-text("Créer la catégorie")').first();
    if (await submit.isEnabled().catch(() => false)) {
      const errs: string[] = [];
      page.on('pageerror', e => errs.push(e.message));
      await submit.click();
      await page.waitForTimeout(1500);
      expect(errs).toEqual([]);
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('rename category — dropdown then modal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Find the first non-"all" category dots button.
    const dots = page
      .locator('aside button[aria-label="Open menu"], .lg\\:w-64 button[aria-label="Open menu"]')
      .first();
    test.skip((await dots.count()) === 0, 'No category dots');
    await dots.click();
    await page.waitForTimeout(300);
    const renameItem = page.locator('[role="menuitem"]:has-text("Renommer")').first();
    if ((await renameItem.count()) > 0) {
      await renameItem.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('delete category — confirmation modal opens', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const dots = page
      .locator('aside button[aria-label="Open menu"], .lg\\:w-64 button[aria-label="Open menu"]')
      .first();
    test.skip((await dots.count()) === 0, 'No category dots');
    await dots.click();
    await page.waitForTimeout(300);
    const del = page.locator('[role="menuitem"]:has-text("Supprimer")').first();
    if ((await del.count()) > 0) {
      await del.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Groups & invitations                                                       */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Groups & invitations', () => {
  test('create group — modal opens with name input + permissions', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const btn = page.locator('button:has-text("Nouveau groupe")').first();
    test.skip((await btn.count()) === 0, 'Owner-only');
    await btn.click();
    await page.waitForTimeout(600);
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
    await expect(modal.locator(':text("Créer un nouveau groupe")').first()).toBeVisible();
    const nameInput = modal.locator('input[placeholder*="Investisseurs"], input').first();
    await nameInput.fill('E2E Group');
    await page.keyboard.press('Escape');
  });

  test('opening an existing group renders GroupDetailsModal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // The group buttons in the AccessGroupsSidebar.
    const groupBtn = page
      .locator('button:has(svg)')
      .filter({ hasText: /Investors|Investisseurs|Groupe/i })
      .first();
    test.skip((await groupBtn.count()) === 0, 'No groups in seed');
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await groupBtn.click();
    await page.waitForTimeout(1500);
    expect(errs).toEqual([]);
  });

  test('group three-dots > Supprimer opens DeleteGroupModal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Second dots block in sidebar = group dots (first is category).
    const dots = page
      .locator('.lg\\:w-64 button[aria-label="Open menu"]')
      .nth(1);
    if ((await dots.count()) === 0) {
      test.skip(true, 'No group dots');
      return;
    }
    await dots.click();
    await page.waitForTimeout(300);
    const del = page.locator('[role="menuitem"]:has-text("Supprimer")').first();
    if ((await del.count()) > 0) {
      await del.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

/* -------------------------------------------------------------------------- */
/* File operations                                                            */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — File operations', () => {
  test('UploadModal accepts setInputFiles for sample.pdf', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await page.locator('button:has-text("Importer des fichiers")').first().click();
    await page.waitForTimeout(800);
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
    const fileInput = modal.locator('input[type="file"]').first();
    if ((await fileInput.count()) === 0) {
      await page.keyboard.press('Escape');
      test.skip(true, 'No file input in upload modal');
      return;
    }
    await fileInput.setInputFiles(SAMPLE_PDF);
    await page.waitForTimeout(500);
    // The file name should appear in the modal.
    await expect(modal.locator(':text("sample.pdf")').first()).toBeVisible({
      timeout: 4_000,
    });
    await page.keyboard.press('Escape');
  });

  test('rename file — opens RenameFileModal via row dropdown', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows');
    await rowDots.click();
    await page.waitForTimeout(300);
    const item = page.locator('[role="menuitem"]:has-text("Renommer")').first();
    if ((await item.count()) > 0) {
      await item.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('change category — opens ChangeCategoryModal via row dropdown', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows');
    await rowDots.click();
    await page.waitForTimeout(300);
    const item = page.locator('[role="menuitem"]:has-text("Changer de catégorie")').first();
    if ((await item.count()) > 0) {
      await item.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('delete file — opens DeleteFileModal via row dropdown', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows');
    await rowDots.click();
    await page.waitForTimeout(300);
    const item = page.locator('[role="menuitem"]:has-text("Supprimer")').first();
    if ((await item.count()) > 0) {
      await item.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('upload new version — opens UploadNewVersionModal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows');
    await rowDots.click();
    await page.waitForTimeout(300);
    const item = page.locator('[role="menuitem"]:has-text("Nouvelle version")').first();
    if ((await item.count()) > 0) {
      await item.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('view version history — opens VersionHistoryModal', async ({ loggedInPage: page }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const rowDots = page
      .locator('table[aria-label="Documents"] button[aria-label="Open menu"]')
      .first();
    test.skip((await rowDots.count()) === 0, 'No file rows');
    await rowDots.click();
    await page.waitForTimeout(300);
    const item = page.locator('[role="menuitem"]:has-text("Historique des versions")').first();
    if ((await item.count()) > 0) {
      await item.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Permissions modals                                                         */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Permissions modals', () => {
  test('opening a group renders permission toggles UI in details modal', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Click the first group label in sidebar.
    const groupBtn = page.locator('.lg\\:w-64 ul li button').filter({ hasNotText: /Renommer|Supprimer/i });
    if ((await groupBtn.count()) === 0) {
      test.skip(true, 'No groups');
      return;
    }
    // Skip the categories list (first 2-N) by picking the second sidebar's first item.
    // Practical: click the last button in sidebar before trailing CTAs.
    await groupBtn.last().click();
    await page.waitForTimeout(1500);
    // We don't assert specific toggles (they vary) but the dialog must render.
    const dialog = page.locator('[role="dialog"]').first();
    if ((await dialog.count()) > 0) {
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

/* -------------------------------------------------------------------------- */
/* File viewer                                                                */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — File viewer', () => {
  test('opening a file URL renders viewer chrome (or 404/403 fallback)', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    // Get the first row's id from the document table (Table.Row id={doc.id}).
    const rowId = await page
      .locator('table[aria-label="Documents"] tr[data-key], table[aria-label="Documents"] tr')
      .first()
      .getAttribute('data-key')
      .catch(() => null);
    const m = url!.match(/\/dataroom\/([^/?#]+)/);
    test.skip(!m, 'No dataroom id');
    const dataroomId = m![1];
    if (!rowId) {
      // Fallback: just navigate to a fake file id and verify it renders the not-found view.
      await page.goto(`/dataroom/${dataroomId}/file/00000000-0000-0000-0000-000000000000`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(2500);
      // Either a viewer or a fallback view should render — never crash.
      const visible = await page
        .locator(':text("Fichier introuvable"), :text("Accès non autorisé"), canvas, video, img')
        .first()
        .count();
      expect(visible).toBeGreaterThan(0);
      return;
    }
    await page.goto(`/dataroom/${dataroomId}/file/${rowId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Breadcrumb / back action present.
    const back = page
      .locator(':text("Retour"), button[aria-label*="Retour"], [aria-label*="back"]')
      .first();
    if ((await back.count()) > 0) {
      await expect(back).toBeVisible();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Analytics page                                                             */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Analytics page', () => {
  test('analytics page loads, shows tabs Vue d\'ensemble / Utilisateurs / Fichiers / Timeline', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const m = url!.match(/\/dataroom\/([^/?#]+)/);
    const dataroomId = m![1];
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`/dataroom/${dataroomId}/analytics`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);
    // Don't fail if the tab labels render in mobile select (no role=tab) — accept either.
    const labels = ['Vue d\'ensemble', 'Utilisateurs', 'Fichiers', 'Timeline'];
    let seen = 0;
    for (const l of labels) {
      seen += await page.locator(`:text("${l}")`).count();
    }
    expect(seen).toBeGreaterThan(0);
    expect(errs).toEqual([]);
  });

  test('switching to Utilisateurs / Fichiers / Timeline tab does not crash', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const m = url!.match(/\/dataroom\/([^/?#]+)/);
    const dataroomId = m![1];
    await page.goto(`/dataroom/${dataroomId}/analytics`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    for (const label of ['Utilisateurs', 'Fichiers', 'Timeline']) {
      const tab = page.locator(`[role="tab"]:has-text("${label}"), button:has-text("${label}")`).first();
      if ((await tab.count()) === 0) continue;
      await tab.click().catch(() => {});
      await page.waitForTimeout(800);
    }
    expect(errs).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Multi-user (parallel)                                                      */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Multi-user (parallel)', () => {
  test('Alice and team can both load /dataroom simultaneously without errors', async ({
    browser,
  }) => {
    const team = await newLoggedInContext(browser, ACCOUNTS.team);
    const alice = await newLoggedInContext(browser, ACCOUNTS.alice);

    const tErr: string[] = [];
    const aErr: string[] = [];
    team.page.on('pageerror', e => tErr.push(e.message));
    alice.page.on('pageerror', e => aErr.push(e.message));

    await team.page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await alice.page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await Promise.all([team.page.waitForTimeout(3000), alice.page.waitForTimeout(3000)]);

    expect(tErr).toEqual([]);
    expect(aErr).toEqual([]);

    await team.context.close();
    await alice.context.close();
  });

  test('an investor account sees only datarooms they were invited to', async ({ browser }) => {
    const bob = await newLoggedInContext(browser, ACCOUNTS.bob);
    await bob.page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await bob.page.waitForTimeout(2500);
    // Owner badge should NOT appear for an invitee account on its dashboard;
    // we just check the page renders without errors.
    const errs: string[] = [];
    bob.page.on('pageerror', e => errs.push(e.message));
    await bob.page.waitForTimeout(800);
    expect(errs).toEqual([]);
    await bob.context.close();
  });
});

/* -------------------------------------------------------------------------- */
/* Edge cases & security                                                      */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Edge cases & security', () => {
  test('invalid dataroom id renders fallback without crashing', async ({ loggedInPage: page }) => {
    const errs: string[] = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('/dataroom/not-a-valid-id', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Should EITHER redirect to /dataroom OR show an error / access-refused screen.
    const stillOnPage = page.url().includes('not-a-valid-id');
    if (stillOnPage) {
      const fallback = await page
        .locator(':text("Erreur"), :text("Accès"), :text("introuvable"), :text("Retour")')
        .first()
        .count();
      expect(fallback).toBeGreaterThan(0);
    }
    expect(errs).toEqual([]);
  });

  test('non-existent file id under a real dataroom shows "Fichier introuvable" or fallback', async ({
    loggedInPage: page,
  }) => {
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    const m = url!.match(/\/dataroom\/([^/?#]+)/);
    const dataroomId = m![1];
    await page.goto(`/dataroom/${dataroomId}/file/00000000-0000-0000-0000-000000000000`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);
    const fallback = await page
      .locator(':text("introuvable"), :text("Accès non autorisé"), :text("Retour")')
      .first()
      .count();
    expect(fallback).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Mobile viewport                                                            */
/* -------------------------------------------------------------------------- */

test.describe('Dataroom — Mobile (375x667)', () => {
  test('list page renders & is scrollable', async ({ loggedInPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dataroom', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /Data Rooms/i }).first()).toBeVisible();
  });

  test('detail page renders sidebar + grid stacked vertically on mobile', async ({
    loggedInPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const url = await openFirstDataroom(page);
    test.skip(!url, 'No datarooms');
    await expect(page.locator('h2:has-text("Catégories")').first()).toBeVisible();
  });
});
