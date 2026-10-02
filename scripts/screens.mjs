// Maakt schermafbeeldingen om de site te bekijken.
// Gebruik: node scripts/screens.mjs [uitvoermap] [pagina,pagina] [thema,thema] [desktop,mobiel]
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const out = process.argv[2] || 'screens';
const pages = (process.argv[3] || '/,/het-blik').split(',');
const themes = (process.argv[4] || 'mosterd').split(',');
const sizes = (process.argv[5] || 'desktop').split(',');
const base = process.env.BASE || 'http://127.0.0.1:4321';
const vp = { desktop: { width: 1440, height: 900 }, mobiel: { width: 390, height: 844 } };
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const size of sizes) {
  for (const theme of themes) {
    const ctx = await browser.newContext({ viewport: vp[size], locale: 'nl-NL', timezoneId: 'Europe/Amsterdam', deviceScaleFactor: 1 });
    await ctx.addCookies([{ name: 'mando_age', value: '1', url: base }]);
    await ctx.addInitScript(() => localStorage.setItem('mando-consent', JSON.stringify({ v: 1, ts: Date.now(), necessary: true, stats: false, social: false })));
    for (const p of pages) {
      const page = await ctx.newPage();
      const msgs = [];
      page.on('console', (m) => { if (m.type() === 'error') msgs.push(m.text()); });
      page.on('pageerror', (e) => msgs.push('pageerror: ' + e.message));
      await page.goto(`${base}${p}${p.includes('?') ? '&' : '?'}theme=${theme}`, { waitUntil: 'networkidle' });
      // laat alle reveals zien
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
        const imgs = [...document.querySelectorAll('img')].filter((i) => i.offsetParent !== null);
        imgs.forEach((i) => { i.loading = 'eager'; });
        await Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
      });
      await page.waitForTimeout(500);
      const name = `${out}/${(p === '/' ? 'home' : p.replace(/[\/?=&]/g, '_').replace(/^_/, ''))}-${theme}-${size}.png`;
      await page.screenshot({ path: name, fullPage: true });
      if (msgs.length) console.log(p, theme, size, 'console:', msgs.slice(0, 4));
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
console.log('klaar');
