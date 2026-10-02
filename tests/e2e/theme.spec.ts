import { test, expect } from '@playwright/test';
import { skipOverlays } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

const cases: [string, string, string][] = [
  ['2026-10-02T03:00:00+02:00', 'nacht', '03:00'],
  ['2026-10-02T08:00:00+02:00', 'creme', '08:00'],
  ['2026-10-02T13:00:00+02:00', 'mosterd', '13:00'],
  ['2026-10-02T18:30:00+02:00', 'terra', '18:30'],
  ['2026-10-02T21:30:00+02:00', 'nacht', '21:30'],
  ['2026-06-21T22:30:00+02:00', 'terra', '22:30 in juni (zon gaat laat onder)'],
  ['2026-12-21T17:30:00+01:00', 'nacht', '17:30 in december (zon is al onder)'],
];

for (const [iso, expected, label] of cases) {
  test(`automatisch thema om ${label} is ${expected}`, async ({ page }) => {
    await page.clock.install({ time: new Date(iso) });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', expected);
  });
}

test('hero, footer en kleuren volgen het thema', async ({ page }) => {
  for (const t of ['creme', 'mosterd', 'terra', 'nacht']) {
    await page.goto(`/?theme=${t}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', t);
    // alleen de hero-laag van dit thema is zichtbaar
    for (const other of ['creme', 'mosterd', 'terra', 'nacht']) {
      const vis = await page.locator(`.hero-bgp[data-for="${other}"]`).isVisible();
      expect(vis, `hero ${other} bij thema ${t}`).toBe(other === t);
    }
    // footer-afbeelding past bij thema
    const footerKind = { creme: 'footer-creme', mosterd: 'footer-creme', terra: 'footer-terra', nacht: 'footer-nacht' }[t]!;
    const src = await page.locator('.footer-art:visible').getAttribute('src');
    expect(src).toContain(footerKind);
    // logo: licht op nacht, donker op de rest
    const logo = await page.locator('.site-header .logo img:visible').getAttribute('src');
    expect(logo).toContain(t === 'nacht' ? 'logo-creme' : 'logo-espresso');
  }
  await page.goto('/?theme=nacht');
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.goto('/?theme=creme');
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
});

test('knop wisselt tussen auto, dag en nacht en onthoudt de keuze', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-02T13:00:00+02:00') });
  await page.goto('/');
  const btn = page.locator('[data-theme-toggle]');
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'auto');
  await expect(btn).toHaveAttribute('aria-label', /Automatisch|Auto/);
  await btn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'dag');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mosterd');
  await btn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'nacht');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nacht');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nacht');
  await btn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'auto');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mosterd');
});

test('thema wisselt vanzelf als de zon ondergaat', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-02T19:40:00+02:00') });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'terra');
  await page.clock.fastForward('00:30:00');
  await page.clock.runFor('00:05:00');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nacht', { timeout: 10_000 });
});
