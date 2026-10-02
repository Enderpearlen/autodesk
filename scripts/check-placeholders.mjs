// Toont alle placeholders ([X: ...]) in de gebouwde site. Met --strict faalt het zolang er nog placeholders zijn.
// Gebruik: npm run build && npm run check:placeholders   (of: npm run check:live)
import fs from 'node:fs';
import path from 'node:path';

const strict = process.argv.includes('--strict');
const dist = 'dist';
if (!fs.existsSync(dist)) { console.error('Geen dist-map. Draai eerst: npm run build'); process.exit(2); }

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist).filter((f) => f.endsWith('.html'));
const re = /\[X(?::[^\]]*)?\]/g;
const unique = new Map();
let total = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const found = text.match(re) ?? [];
  total += found.length;
  const page = '/' + path.relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  for (const m of new Set(found)) {
    const set = unique.get(m) ?? new Set();
    set.add(page);
    unique.set(m, set);
  }
}

// Placeholder-vlaggen in de configuratie
const flagged = [];
for (const f of ['src/config/site.ts', 'src/content/stores.ts']) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => { if (/placeholder:\s*true/.test(l)) flagged.push(`${f}:${i + 1}`); });
}
const idx = fs.readFileSync('src/config/site.ts', 'utf8').match(/indexable:\s*(true|false)/)?.[1];

console.log(`Placeholders in de site: ${unique.size} verschillende, ${total} keer gebruikt\n`);
for (const [m, pages] of [...unique.entries()].sort()) console.log(`  ${m}\n    op: ${[...pages].slice(0, 6).join(', ')}${pages.size > 6 ? ' en meer' : ''}`);
console.log(`\nVlaggen placeholder: true in configuratie: ${flagged.length}`);
flagged.forEach((x) => console.log(`  ${x}`));
console.log(`\nfeatures.indexable staat op ${idx}. Zet hem pas op true als alles hierboven is ingevuld.`);
if (strict && (unique.size || flagged.length || idx !== 'true')) {
  console.error('\ncheck:live gefaald: de site is nog niet klaar om live te gaan.');
  process.exit(1);
}
