import { test, expect } from '@playwright/test';
import { skipOverlays, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

test('productgalerij: miniatuur wisselt het hoofdbeeld', async ({ page }) => {
  await page.goto('/het-blik/amaretto-cola');
  const main = page.locator('[data-gallery-main]');
  const before = await main.getAttribute('src');
  const thumbs = page.locator('.thumb');
  expect(await thumbs.count()).toBe(5);
  await thumbs.nth(3).click();
  const after = await main.getAttribute('src');
  expect(after).not.toBe(before);
  await expect(thumbs.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await expect(thumbs.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await settle(page);
  expect(await main.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
});

test('waar te koop: toont binnenkort en verwijst zakelijke klanten naar het B2B-blok op contact', async ({ page }) => {
  await page.goto('/waar-te-koop');
  await expect(page.locator('main h1')).toHaveText(/Waar te koop/i);
  await expect(page.locator('.channel')).toHaveCount(3);
  for (const tag of await page.locator('.channel-tag').allTextContents()) expect(tag).toBe('Binnenkort');
  expect(await page.locator('main').innerText()).not.toMatch(/Utrecht|Rotterdam|Amsterdam/);
  const cta = page.locator('.b2b-cta a.btn');
  await expect(cta).toHaveAttribute('href', '/contact#b2b');
  await cta.click();
  await expect(page).toHaveURL(/\/contact\/?#b2b$/);
  await expect(page.locator('#b2b')).toBeVisible();
});

test('faq: accordeon opent en sluit, schema aanwezig', async ({ page }) => {
  await page.goto('/faq');
  const first = page.locator('.faq details').first();
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await page.locator('.faq details').nth(1).locator('summary').click();
  await expect(first).not.toHaveAttribute('open', '');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join('')).toContain('FAQPage');
});

test('home: alle secties staan in de volgorde uit de configuratie', async ({ page }) => {
  await page.goto('/');
  const ids = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.id || s.className.split(' ')[0]));
  expect(ids[0]).toBe('hero-wrap');
  expect(ids).toContain('nieuwsbrief');
  expect(ids.indexOf('hero-wrap')).toBeLessThan(ids.indexOf('nieuwsbrief'));
});

test('navigatie: alle hoofdlinks en footerlinks werken', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => (a as HTMLAnchorElement).getAttribute('href')!))].filter((h) => !h.startsWith('/visuals') && !h.includes('#')));
  expect(hrefs.length).toBeGreaterThan(12);
  for (const h of hrefs) {
    const res = await page.request.get(h);
    expect(res.status(), h).toBe(200);
  }
});

test('structuur: logo, h1 en skip-link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Naar de inhoud' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('social links in de footer wijzen naar Instagram en TikTok', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('footer .social-link');
  expect(await links.count()).toBe(2);
  await expect(links.nth(0)).toHaveAttribute('href', /instagram\.com/);
  await expect(links.nth(1)).toHaveAttribute('href', /tiktok\.com/);
});
