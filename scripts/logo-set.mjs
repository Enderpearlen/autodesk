// Maakt de hele logoset (logo, merkteken, favicons) uit je definitieve bestanden. Gebruik:
//   node scripts/logo-set.mjs --logo=logo-donker.svg --logo-light=logo-licht.svg --mark=teken-donker.svg --mark-light=teken-licht.svg
//
//   --logo        woordmerk of logo in een donkere kleur, voor een lichte pagina (svg of png met transparante achtergrond)
//   --logo-light  hetzelfde in een lichte kleur, voor een donkere pagina. Zonder dit bestand wordt --logo ook voor donker gebruikt.
//   --mark        los merkteken (bijvoorbeeld de amandel), donker. Zonder dit bestand blijven teken en favicons zoals ze zijn.
//   --mark-light  merkteken in lichte kleur (komt in de favicon, op espresso). Zonder dit bestand wordt --mark gebruikt.
//   --out         doelmap, standaard public/visuals/logo
//
// Schrijft logo-espresso, logo-creme, teken-espresso, teken-creme (svg en png) en favicon-32/48/180/512.png,
// en past de afmetingen van het logo aan in src/config/visuals.ts. Daarna: npm run build en kijk naar het resultaat.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=').slice(1).join('=');
const out = arg('out') || 'public/visuals/logo';
const files = { logo: arg('logo'), logoLight: arg('logo-light') || arg('logo'), mark: arg('mark'), markLight: arg('mark-light') || arg('mark') };
if (!files.logo && !files.mark) { console.error('Geef minstens --logo of --mark mee. Zie de uitleg bovenaan dit bestand.'); process.exit(2); }
for (const f of Object.values(files)) if (f && !fs.existsSync(f)) { console.error(`Bestand niet gevonden: ${f}`); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const isSvg = (f) => f.toLowerCase().endsWith('.svg');
/** Schrijft een logo als svg (als de bron svg is) en altijd als png. Geeft de verhouding breedte/hoogte terug. */
async function put(src, name, maxW) {
  const meta = await sharp(src, { density: 300 }).metadata();
  if (isSvg(src)) fs.copyFileSync(src, path.join(out, `${name}.svg`));
  await sharp(src, { density: 300 }).resize({ width: Math.min(maxW, meta.width), withoutEnlargement: false }).png().toFile(path.join(out, `${name}.png`));
  console.log(`  ${name}.${isSvg(src) ? 'svg + png' : 'png'}  (${meta.width}x${meta.height})`);
  return meta.width / meta.height;
}

let ratio = 0;
if (files.logo) {
  console.log('Logo:');
  ratio = await put(files.logo, 'logo-espresso', 2000);
  await put(files.logoLight, 'logo-creme', 2000);
}
if (files.mark) {
  console.log('Merkteken:');
  await put(files.mark, 'teken-espresso', 400);
  await put(files.markLight, 'teken-creme', 400);
  console.log('Favicons (teken op espresso):');
  for (const size of [32, 48, 180, 512]) {
    const pad = Math.round(size * 0.18);
    const inner = await sharp(files.markLight, { density: 300 }).resize({ width: size - 2 * pad, height: size - 2 * pad, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 3, background: '#2B1A12' } }).composite([{ input: inner, gravity: 'centre' }]).png().toFile(path.join(out, `favicon-${size}.png`));
    console.log(`  favicon-${size}.png`);
  }
}

if (ratio && path.resolve(out) === path.resolve('public/visuals/logo')) {
  const h = Math.round(480 / ratio);
  const f = 'src/config/visuals.ts';
  const t = fs.readFileSync(f, 'utf8').replace(/(logo\/logo-(?:espresso|creme)\.svg'\), alt: 'Mando', w: )\d+(, h: )\d+/g, `$1480$2${h}`);
  fs.writeFileSync(f, t);
  console.log(`\nAfmeting van het logo in ${f} gezet op 480x${h}.`);
}
console.log('\nKlaar. Draai nu npm run build en bekijk header, footer, het tabblad-icoon en /stijlgids.');
