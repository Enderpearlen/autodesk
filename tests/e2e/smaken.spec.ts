import { test, expect } from '@playwright/test';
import { skipOverlays, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

const slugs = ['amaretto-cola', 'amaretto-cassis', 'amaretto-cola-zero', 'amaretto-ice-tea'];

test('homepage: Cola is de enige beschikbare smaak, de andere drie zijn verduisterd met Binnenkort', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const tiles = page.locator('.flavour-row .flavour-tile');
  await expect(tiles).toHaveCount(4);
  await expect(page.locator('.flavour-row a.flavour-tile')).toHaveCount(1);
  await expect(page.locator('.flavour-row a.flavour-tile')).toHaveAttribute('href', '/het-blik/amaretto-cola');
  const soon = page.locator('.flavour-tile.is-soon');
  await expect(soon).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(soon.nth(i).locator('.soon-badge')).toHaveText('Binnenkort');
    const f = await soon.nth(i).locator('img').evaluate((e) => getComputedStyle(e).filter);
    expect(f).toContain('brightness(0.38)');
    expect(await soon.nth(i).evaluate((e) => e.tagName)).toBe('DIV');
  }
  await expect(page.getByRole('heading', { name: 'We starten met Amaretto Cola' })).toBeVisible();
  await expect(page.locator('.feature-media img:not(.sticker)')).toBeVisible();
});

test('het blik is de homepage: geen menu-item en /het-blik stuurt door naar /', async ({ page }) => {
  await page.goto('/');
  const labels = await page.locator('.nav a').allTextContents();
  expect(labels).not.toContain('Het blik');
  await page.goto('/het-blik');
  await page.waitForURL((u) => u.pathname === '/');
  expect(new URL(page.url()).pathname).toBe('/');
});

test('elke productpagina toont blik, feiten en de notenzin', async ({ page }) => {
  for (const slug of slugs) {
    await page.goto(`/het-blik/${slug}`);
    await settle(page);
    await expect(page.locator('main h1')).toBeVisible();
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/Ingrediënten/i);
    expect(text).toMatch(/Bevat geen noten, alleen amandelsmaak/);
    expect(text).toMatch(/250 ml/);
    const loaded = await page.locator('[data-gallery-main]').evaluate((i) => (i as HTMLImageElement).naturalWidth > 0);
    expect(loaded).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('smaken die nog niet te koop zijn tonen een banner, geen aankoopknop en staan op noindex', async ({ page }) => {
  await page.goto('/het-blik/amaretto-cassis');
  await expect(page.locator('.soon-note')).toContainText('Binnenkort');
  await expect(page.locator('main a.btn', { hasText: 'Waar te koop' })).toHaveCount(0);
  await expect(page.locator('main a.btn', { hasText: 'Blijf op de hoogte' })).toHaveAttribute('href', '/#nieuwsbrief');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await page.goto('/het-blik/amaretto-cola');
  await expect(page.locator('.soon-note')).toHaveCount(0);
  await expect(page.locator('main a.btn', { hasText: 'Waar te koop' })).toHaveAttribute('href', '/waar-te-koop');
  await expect(page.locator('.others .flavour-tile.is-soon')).toHaveCount(3);
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

test('sitemap bevat alleen beschikbare smaken', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('/het-blik/amaretto-cola');
  expect(xml).not.toContain('/het-blik/amaretto-cassis');
  expect(xml).not.toContain('<loc>https://www.mando-drinks.example/het-blik</loc>');
});
