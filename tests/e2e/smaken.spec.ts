import { test, expect } from '@playwright/test';
import { skipOverlays, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

const slugs = ['amaretto-cola', 'amaretto-cassis', 'amaretto-cola-zero', 'amaretto-ice-tea'];

test('homepage toont de vier smaken met een link per smaak', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const links = page.locator('.flavour-row a');
  await expect(links).toHaveCount(4);
  for (let i = 0; i < 4; i++) await expect(links.nth(i)).toHaveAttribute('href', `/het-blik/${slugs[i]}`);
  await expect(page.locator('.feature-media img:not(.sticker)')).toBeVisible();
});

test('overzicht en elke productpagina tonen blik, feiten en de notenzin', async ({ page }) => {
  await page.goto('/het-blik');
  await expect(page.locator('.range-item')).toHaveCount(4);
  for (const slug of slugs) {
    await page.goto(`/het-blik/${slug}`);
    await settle(page);
    await expect(page.locator('main h1')).toBeVisible();
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/Ingrediënten/i);
    expect(text).toMatch(/Bevat geen noten, alleen amandelsmaak/);
    expect(text).toMatch(/250 ml/);
    // het productbeeld is geladen
    const loaded = await page.locator('[data-gallery-main]').evaluate((i) => (i as HTMLImageElement).naturalWidth > 0);
    expect(loaded).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('cola heeft een galerij met vijf beelden, de andere smaken een enkel beeld', async ({ page }) => {
  await page.goto('/het-blik/amaretto-cola');
  await expect(page.locator('.thumb')).toHaveCount(5);
  await page.goto('/het-blik/amaretto-cassis');
  await expect(page.locator('.thumb')).toHaveCount(0);
});

test('nieuwe smaken hebben het alcoholpercentage als te bevestigen placeholder', async ({ page }) => {
  await page.goto('/het-blik/amaretto-ice-tea');
  const row = page.locator('.facts').getByText('7% vol');
  await expect(row).toBeVisible();
  expect(await page.locator('.facts mark.ph').count()).toBeGreaterThanOrEqual(3);
});

test('sitemap bevat de productpagina\'s', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const s of slugs) expect(xml).toContain(`/het-blik/${s}`);
});
