import { test, expect } from '@playwright/test';
import { skipOverlays } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

for (const width of [390, 768, 1024, 1280, 1920]) {
  test(`geen horizontale overflow op ${width}px (alle themas)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const t of ['creme', 'nacht']) {
      for (const route of ['/', '/het-blik', '/waar-te-koop', '/contact']) {
        await page.goto(`${route}?theme=${t}`);
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw, `${route} ${t} ${width}`).toBeLessThanOrEqual(o.cw + 1);
      }
    }
  });
}

test('desktop: navigatie staat op één regel en de header is maximaal 80px', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/');
  const h = await page.locator('.site-header').boundingBox();
  expect(h!.height).toBeLessThanOrEqual(80);
  const tops = await page.locator('.nav li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await expect(page.locator('.burger')).toBeHidden();
});

test('mobiel menu: openen, sluiten met Esc, links werken', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const burger = page.locator('.burger');
  await expect(page.locator('.nav')).toBeHidden();
  await burger.click();
  await expect(page.locator('[data-menu]')).toBeVisible();
  await expect(burger).toHaveAttribute('aria-expanded', 'true');
  expect(await page.locator('main').getAttribute('inert')).not.toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(burger).toBeFocused();
  await burger.click();
  await page.locator('.menu-link', { hasText: 'Verhaal' }).click();
  await expect(page).toHaveURL(/\/verhaal/);
  await expect(page.locator('[data-menu]')).toBeHidden();
});

test('hero: tekst en knoppen zijn zichtbaar zonder scrollen op desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?theme=terra');
  const h1 = await page.locator('.hero-wrap h1').boundingBox();
  const cta = await page.locator('.hero-wrap .btn').first().boundingBox();
  expect(h1!.y + h1!.height).toBeLessThan(720);
  expect(cta!.y + cta!.height).toBeLessThan(720);
  // het blik staat rechts van de tekst
  const can = await page.locator('.hero-can').boundingBox();
  const text = await page.locator('.hero-copy-inner').boundingBox();
  expect(can!.x).toBeGreaterThan(text!.x + text!.width * 0.7);
});

test('hero: op telefoon staat de tekst onder het beeld', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?theme=nacht');
  const hero = await page.locator('.hero').boundingBox();
  const copy = await page.locator('.hero-copy').boundingBox();
  expect(copy!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height - 2);
  const can = await page.locator('.hero-can').boundingBox();
  expect(can!.x + can!.width / 2).toBeGreaterThan(150);
  expect(can!.x + can!.width / 2).toBeLessThan(240);
});
