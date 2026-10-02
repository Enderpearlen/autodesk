import { test, expect } from '@playwright/test';
import { skipOverlays, routes, settle } from './helpers';

test.beforeEach(async ({ context }) => { await skipOverlays(context); });

for (const route of routes) {
  test(`pagina ${route}: laadt zonder fouten, afbeeldingen en layout kloppen`, async ({ page }) => {
    const errors: string[] = [];
    const bad: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('response', (r) => { if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });

    const res = await page.goto(route, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await settle(page);

    expect(errors, 'console fouten').toEqual([]);
    expect(bad, 'mislukte verzoeken').toEqual([]);

    // één h1, één main, titel
    await expect(page.locator('h1:visible')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect((await page.title()).length).toBeGreaterThan(5);

    // alle zichtbare afbeeldingen zijn echt geladen
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0)
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src),
    );
    expect(broken, 'kapotte afbeeldingen').toEqual([]);

    // geen horizontale scroll
    const over = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(over.sw, 'horizontale overflow').toBeLessThanOrEqual(over.cw + 1);

    // geen liggende streepjes in zichtbare tekst
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[–—]/);
  });
}

test('404 pagina bestaat en toont het blik', async ({ page }) => {
  const res = await page.goto('/bestaat-niet');
  expect(res?.status()).toBe(404);
  await expect(page.locator('main h1')).toContainText('omgevallen');
  await settle(page);
  const ok = await page.evaluate(() => [...document.querySelectorAll('.hero-404 img')].every((i) => (i as HTMLImageElement).naturalWidth > 0));
  expect(ok).toBe(true);
});

test('robots en sitemap bestaan en site staat dicht voor zoekmachines', async ({ request, page }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Disallow: /');
  const sm = await request.get('/sitemap.xml');
  expect(sm.status()).toBe(200);
  expect(await sm.text()).toContain('/het-blik');
  await page.goto('/');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
});
