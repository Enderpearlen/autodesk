import { test, expect } from '@playwright/test';
import { skipOverlays, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });


test('licht gebruikt in elk lichtthema dezelfde merkkleuren, donker wijkt alleen in licht en donker af', async ({ page }) => {
  const names = ['--bg', '--fg', '--accent', '--band1', '--band2', '--btn-bg', '--btn-fg', '--gold'];
  const read = async (theme: string) => {
    await page.goto(`/?theme=${theme}`);
    return page.evaluate((ns) => ns.map((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()), names);
  };
  const creme = await read('creme');
  expect(await read('mosterd')).toEqual(creme);
  expect(await read('terra')).toEqual(creme);
  const nacht = await read('nacht');
  const goldIdx = names.indexOf('--gold');
  expect(nacht[goldIdx]).toBe(creme[goldIdx]);
  expect(nacht[names.indexOf('--bg')]).not.toBe(creme[names.indexOf('--bg')]);
  expect(nacht[names.indexOf('--band1')]).toBe(creme[names.indexOf('--band1')]);
});

test('themaknop is klein en rond', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('[data-theme-toggle]');
  if (await btn.isVisible()) {
    const box = (await btn.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(40);
    expect(box.height).toBeLessThanOrEqual(40);
    expect(await btn.evaluate((e) => getComputedStyle(e).borderRadius)).toBe('50%');
  }
});

test('actiebar staat onder de header, sluit en blijft dicht na herladen', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('[data-announcement]');
  await expect(bar).toBeVisible();
  const header = (await page.locator('.site-header').boundingBox())!;
  const barBox = (await bar.boundingBox())!;
  expect(barBox.y).toBeGreaterThanOrEqual(header.y + header.height - 2);
  await page.locator('[data-announcement-close]').click();
  await expect(bar).toBeHidden();
  await page.reload();
  await expect(bar).toBeHidden();
});

test('actiebar verdwijnt buiten zijn datumvenster', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__MANDO_CFG', {
      configurable: true,
      set(v) { (this as any)._c = { ...v, bar: { id: 'x', from: '2099-01-01', until: null } }; },
      get() { return (this as any)._c; },
    });
  });
  await page.goto('/');
  await expect(page.locator('[data-announcement]')).toBeHidden();
});

test('homepage: quote, voorbeeldreviews en geen ingrediëntenlijst', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  await expect(page.getByText('Van en voor de echte genieters')).toBeVisible();
  const reviews = page.locator('.review');
  await expect(reviews).toHaveCount(3);
  for (let i = 0; i < 3; i++) await expect(reviews.nth(i).locator('.review-tag')).toHaveText('Voorbeeldreview');
  await expect(reviews.first().locator('.stars')).toHaveAttribute('aria-label', /5 van 5 sterren/);
  expect(await page.locator('main').innerText()).not.toMatch(/Ingrediënten/i);
  await page.goto('/het-blik');
  expect(await page.locator('main').innerText()).toMatch(/Ingrediënten/i);
});

test('de naam komt van mandorla, het Italiaanse woord voor amandel', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('main').innerText();
  expect(text).toMatch(/mandorla/i);
  expect(text).not.toMatch(/mandorlo/i);
  expect(text).toMatch(/Italiaanse woord voor amandel\b/);
  await page.goto('/verhaal');
  expect(await page.locator('main').innerText()).not.toMatch(/mandorlo/i);
});
