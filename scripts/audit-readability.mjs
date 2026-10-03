// Zoekt slecht leesbare tekst en elementen die over elkaar liggen. Gebruik: npm run audit:read
//
// Per pagina, thema en schermbreedte: alle tekst wordt transparant gemaakt, de pagina wordt gefotografeerd en
// onder elke tekstregel wordt de echte achtergrond gemeten (ook foto's, sterren en patronen). Daarna wordt het
// contrast met de echte tekstkleur uitgerekend. Verder wordt gemeld als tekstregels over elkaar heen vallen,
// als de pagina breder is dan het scherm en als tekst buiten het beeld valt.
//
// Opties: --base=http://127.0.0.1:4321  --pages=/,/contact  --themes=creme,nacht  --sizes=390,1440  --json=uit.json
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const arg = (name, def) => (process.argv.find((a) => a.startsWith(`--${name}=`)) ?? '').split('=').slice(1).join('=') || def;
const base = arg('base', process.env.BASE || 'http://127.0.0.1:4321');
const pages = arg('pages', '/,/verhaal,/waar-te-koop,/community,/faq,/contact,/het-blik/amaretto-cola,/het-blik/amaretto-cassis,/18-plus,/juridisch/privacy,/404').split(',');
const themes = arg('themes', 'creme,mosterd,terra,nacht').split(',');
const sizes = arg('sizes', '390,768,1100,1440,1920').split(',').map(Number);
const jsonOut = arg('json', '');
const shotsDir = arg('shots', '');
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
const heights = { 390: 844, 768: 1024, 1100: 800, 1440: 900, 1920: 1080 };

const measure = async (page) => {
  // Een foto van de hele pagina maakt het venster even zo hoog als de pagina. Alles wat op vh of svh rekent (de hero)
  // zou dan meeschalen en de metingen verschuiven. Daarom eerst de hoogte vastzetten op wat het echte venster geeft.
  await page.evaluate(() => {
    document.querySelectorAll('.hero').forEach((el) => { el.style.height = `${el.getBoundingClientRect().height}px`; });
  });
  // 1. verzamel elke zichtbare tekstregel met kleur en afmeting
  const runs = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const sel = (el) => {
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      return `${el.tagName.toLowerCase()}${id}${cls}`;
    };
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || el.closest('script,style,noscript,[hidden],.sr-only,.hp,mark.ph')) continue; // placeholders zijn tijdelijk en bewust opvallend
      const det = el.closest('details');
      if (det && !det.open && !el.closest('summary')) continue; // dichte accordeon: inhoud is niet te zien
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
      let hidden = false;
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        const c = getComputedStyle(p);
        if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) === 0) { hidden = true; break; }
      }
      if (hidden) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      // alleen het deel van de tekst dat echt zichtbaar is (niet weggeklipt door een scrollcontainer)
      const clip = (r) => {
        let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
        for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
          const c = getComputedStyle(p);
          if ((c.overflowX !== 'visible' && c.overflowX !== 'clip') || (c.overflowY !== 'visible' && c.overflowY !== 'clip')) {
            const b = p.getBoundingClientRect();
            box = { l: Math.max(box.l, b.left), t: Math.max(box.t, b.top), r: Math.min(box.r, b.right), b: Math.min(box.b, b.bottom) };
          }
        }
        return box.r - box.l > 2 && box.b - box.t > 2 && (box.r - box.l) * (box.b - box.t) > 0.6 * r.width * r.height;
      };
      // het lettervlak is hoger dan de regel bij een krappe regelhoogte (koppen): meet alleen de regel zelf
      const lh = parseFloat(cs.lineHeight);
      const trim = (r) => (lh > 0 && lh < r.height ? { left: r.left, right: r.right, width: r.width, top: r.top + (r.height - lh) / 2, bottom: r.bottom - (r.height - lh) / 2, height: lh } : r);
      const rects = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && clip(r)).map(trim);
      if (!rects.length) continue;
      const fill = el instanceof SVGElement ? cs.fill : cs.color;
      const m = (fill.match(/[\d.]+/g) || []).map(Number);
      if (m.length < 3 || (m.length > 3 && m[3] < 0.6)) continue;
      // schuin geplaatst (rotate): de omhullende rechthoek klopt niet met de tekst, dus overslaan
      let rotated = false;
      for (let p = el, n = 0; p && n < 4; p = p.parentElement, n++) {
        const m = getComputedStyle(p).transform.match(/matrix\(([^)]+)\)/);
        if (m && Math.abs(parseFloat(m[1].split(',')[1])) > 0.01) rotated = true;
      }
      if (rotated) continue;
      // bewust overlappende decoratie (de klok die over de lopende balk valt)
      const covers = [...document.querySelectorAll('[data-audit-covers]')].map((c) => c.getBoundingClientRect());
      if (covers.some((c) => rects.some((r) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top))) continue;
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      out.push({
        sel: sel(el), text: text.slice(0, 48), rgb: m.slice(0, 3), large: size >= 24 || (bold && size >= 18.66),
        rects: rects.map((r) => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height })),
      });
    }
    return out;
  });

  // 2. tekst transparant, foto van de pagina, achtergrond onder elke regel meten
  await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} svg text{fill:transparent!important}' });
  await page.waitForTimeout(150);
  const buf = await page.screenshot({ fullPage: true });
  const shot = buf.toString('base64');
  page.__buf = buf;
  const bad = await page.evaluate(async ({ shot, runs }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${shot}`;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const found = [];
    for (const run of runs) {
      const lt = L(...run.rgb);
      const need = run.large ? 3 : 4.5;
      let worst = 99, lowPx = 0, total = 0;
      for (const r of run.rects) {
        const x0 = Math.max(0, Math.ceil(r.x) + 1), y0 = Math.max(0, Math.ceil(r.y) + 1);
        const w = Math.min(img.width - x0, Math.floor(r.w) - 2), h = Math.min(img.height - y0, Math.floor(r.h) - 2);
        if (w < 1 || h < 1) continue;
        const d = ctx.getImageData(x0, y0, w, h).data;
        for (let i = 0; i < d.length; i += 8) {
          const lb = L(d[i], d[i + 1], d[i + 2]);
          const c = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
          total++;
          if (c < need * 0.8) lowPx++;
          if (c < worst) worst = c;
        }
      }
      if (total && (lowPx / total > 0.12 || lowPx > 14)) found.push({ kind: 'contrast', sel: run.sel, text: run.text, at: run.rects.map((q) => `${Math.round(q.x)},${Math.round(q.y)},${Math.round(q.w)}x${Math.round(q.h)}`)[0], need, worst: +worst.toFixed(2), share: +(lowPx / total * 100).toFixed(1) });
    }
    return found;
  }, { shot, runs });

  // 3. overlap tussen tekstregels van verschillende elementen
  const overlaps = [];
  const boxes = runs.flatMap((r, i) => r.rects.map((b) => ({ ...b, i })));
  for (let a = 0; a < boxes.length; a++) {
    for (let b = a + 1; b < boxes.length; b++) {
      const A = boxes[a], B = boxes[b];
      if (A.i === B.i || runs[A.i].sel === runs[B.i].sel) continue;
      const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
      const oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
      if (ox > 4 && oy > 4 && (ox * oy) / Math.min(A.w * A.h, B.w * B.h) > 0.25) overlaps.push({ kind: 'overlap', sel: runs[A.i].sel, text: runs[A.i].text, with: `${runs[B.i].sel} "${runs[B.i].text}"` });
    }
  }
  const layout = await page.evaluate(() => {
    const out = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) out.push({ kind: 'overflow', text: `pagina ${document.documentElement.scrollWidth}px breed, scherm ${innerWidth}px` });
    return out;
  });
  const offscreen = runs.filter((r) => r.rects.some((b) => b.x + b.w < 0 || b.x > 1e5)).map((r) => ({ kind: 'buiten beeld', sel: r.sel, text: r.text }));
  return [...bad, ...overlaps, ...layout, ...offscreen];
};

const browser = await chromium.launch();
const results = [];
const jobs = [];
for (const size of sizes) for (const theme of themes) for (const p of pages) jobs.push({ size, theme, p });
let next = 0;
const worker = async () => {
  const ctxs = new Map();
  while (next < jobs.length) {
    const { size, theme, p } = jobs[next++];
    if (!ctxs.has(size)) {
      const ctx = await browser.newContext({ viewport: { width: size, height: heights[size] ?? 900 }, locale: 'nl-NL', timezoneId: 'Europe/Amsterdam', deviceScaleFactor: 1 });
      await ctx.addCookies([{ name: 'mando_age', value: '1', url: base }]);
      await ctx.addInitScript(() => {
        localStorage.setItem('mando-consent', JSON.stringify({ v: 1, ts: Date.now(), necessary: true, stats: false, social: false }));
      });
      ctxs.set(size, ctx);
    }
    const page = await ctxs.get(size).newPage();
    try {
      await page.goto(`${base}${p}${p.includes('?') ? '&' : '?'}theme=${theme}`, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}' });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
        document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
        document.querySelectorAll('[data-clock]').forEach((e) => { e.dataset.state = 'done'; });
        const imgs = [...document.querySelectorAll('img')].filter((i) => i.offsetParent !== null);
        imgs.forEach((i) => { i.loading = 'eager'; });
        await Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
      });
      await page.waitForTimeout(250);
      const found = await measure(page);
      for (const f of found) results.push({ page: p, theme, size, ...f });
      if (shotsDir && found.length) fs.writeFileSync(`${shotsDir}/${p.replace(/\W+/g, '_')}-${theme}-${size}.png`, page.__buf);
    } catch (e) {
      results.push({ page: p, theme, size, kind: 'fout', text: String(e).slice(0, 160) });
    }
    await page.close();
  }
  for (const c of ctxs.values()) await c.close();
};
await Promise.all([worker(), worker(), worker()]);
await browser.close();

// zelfde bevinding op meerdere thema's en maten samenvoegen
const grouped = new Map();
for (const r of results) {
  const key = `${r.kind}|${r.page}|${r.sel ?? ''}|${r.text}`;
  const g = grouped.get(key) ?? { ...r, themes: new Set(), sizes: new Set() };
  g.themes.add(r.theme); g.sizes.add(r.size);
  grouped.set(key, g);
}
const list = [...grouped.values()].sort((a, b) => a.page.localeCompare(b.page) || a.kind.localeCompare(b.kind));
for (const g of list) {
  const extra = g.kind === 'contrast' ? ` contrast ${g.worst} (nodig ${g.need}), ${g.share}% van de pixels, op ${g.at}` : g.with ? ` over ${g.with}` : '';
  console.log(`${g.kind.padEnd(11)} ${g.page.padEnd(26)} ${(g.sel ?? '').padEnd(34)} "${g.text}"${extra}  [${[...g.themes].join(',')} | ${[...g.sizes].join(',')}]`);
}
console.log(`\n${jobs.length} combinaties gemeten, ${list.length} bevindingen`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(list.map((g) => ({ ...g, themes: [...g.themes], sizes: [...g.sizes] })), null, 2));
process.exit(list.length ? 1 : 0);
