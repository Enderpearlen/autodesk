import type { BrowserContext, Page } from '@playwright/test';

export const BASE = 'http://127.0.0.1:4321';

/** Leeftijd bevestigd en cookiekeuze gemaakt, zodat overlays niets in de weg zitten. */
export async function skipOverlays(context: BrowserContext, consent = { stats: false, social: false }) {
  await context.addCookies([{ name: 'mando_age', value: '1', url: BASE }]);
  await context.addInitScript((c) => {
    if (!localStorage.getItem('mando-consent')) localStorage.setItem('mando-consent', JSON.stringify({ v: 1, ts: Date.now(), necessary: true, ...c }));
  }, consent);
}

export const routes = [
  '/', '/het-blik/amaretto-cola', '/het-blik/amaretto-cassis', '/het-blik/amaretto-cola-zero', '/het-blik/amaretto-ice-tea', '/verhaal', '/waar-te-koop', '/community', '/faq', '/contact', '/18-plus', '/leeftijd-nee',
  '/juridisch/privacy', '/juridisch/cookies', '/juridisch/voorwaarden', '/juridisch/disclaimer', '/juridisch/colofon', '/stijlgids',
];

/** Scrolt door de pagina zodat lazy afbeeldingen en reveals worden geladen. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    const imgs = [...document.querySelectorAll('img')].filter((i) => (i as HTMLElement).offsetParent !== null || getComputedStyle(i).display !== 'none');
    imgs.forEach((i) => { (i as HTMLImageElement).loading = 'eager'; });
    await Promise.all(imgs.map((i) => ((i as HTMLImageElement).decode ? (i as HTMLImageElement).decode().catch(() => undefined) : null)));
  });
}
