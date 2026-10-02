// Controleert tekstcontrast (WCAG) van alle themakleuren. Gebruik: npm run check:contrast
import { themes, palette, gold } from '../src/config/themes.ts';

const lum = (hex) => {
  const c = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const rows = [];
for (const [id, t] of Object.entries(themes)) {
  rows.push([id, 'tekst op pagina', t.fg, t.bg, 4.5]);
  rows.push([id, 'gedempte tekst op pagina', t.muted, t.bg, 4.5]);
  rows.push([id, 'links en accent op pagina', t.accent, t.bg, 4.5]);
  rows.push([id, 'tekst op band 1', t.band1Fg, t.band1, 4.5]);
  rows.push([id, 'tekst op band 2', t.band2Fg, t.band2, 4.5]);
  rows.push([id, 'knoptekst', t.btnFg, t.btnBg, 4.5]);
  rows.push([id, 'footertekst', t.footerFg, t.footerBg, 4.5]);
  rows.push([id, 'koptekst op hero (groot, 3:1)', t.heroFg, t.heroEdge, 3]);
  rows.push([id, 'invoerveld', t.fg, t.field, 4.5]);
  rows.push([id, 'knoprand tegen knopvulling (3:1)', t.btnBorder === t.btnBg ? t.btnFg : t.btnBorder, t.btnBg, 1]);
}
// vaste combinaties in componenten
const p = palette;
rows.push(['vast', 'leeftijdscontrole en cookiebanner', p.creme, p.esp, 4.5]);
rows.push(['vast', 'knop in donker paneel', p.esp, p.mosterd, 4.5]);
rows.push(['vast', 'verhaal-sectie (esp op crème)', p.esp, '#EEE2C7', 4.5]);
rows.push(['vast', 'accenttekst in verhaal', p.terraTekst, '#EEE2C7', 4.5]);
rows.push(['vast', 'waar-te-koop band', p.esp, '#E2AF3A', 4.5]);
rows.push(['vast', 'paginakop terra (groot, 3:1)', p.wit, p.terra, 3]);
rows.push(['vast', 'paginakop mosterd', p.esp, p.mosterd, 4.5]);
rows.push(['vast', 'paginakop olijf', p.creme, p.olijfDD, 4.5]);
rows.push(['vast', 'community (crème op espresso)', p.creme, p.esp, 4.5]);
rows.push(['vast', 'hero-tekst mobiel op terra diep', p.wit, p.terraDiep, 4.5]);
rows.push(['vast', 'actiebar (crème op espresso)', p.creme, p.esp, 4.5]);
rows.push(['vast', 'actiebar link (licht goud op espresso)', '#E2C77F', p.esp, 4.5]);
rows.push(['vast', 'sterren licht (donker goud op crème, 3:1)', '#8A6516', p.creme, 3]);
rows.push(['vast', 'sterren donker (goud op espresso, 3:1)', gold, p.esp, 3]);
rows.push(['vast', 'knopring goud op espresso (3:1)', gold, p.esp, 3]);
rows.push(['vast', 'themaknop goudrand op crème (decoratief, icoon heeft eigen contrast)', gold, p.creme, 1.5]);

let bad = 0;
for (const [id, what, fg, bg, min] of rows) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'LAAG'}  ${id.padEnd(8)} ${what.padEnd(36)} ${fg} op ${bg}  ${r.toFixed(2)} (min ${min})`);
}
console.log(bad ? `\n${bad} combinaties onder de grens` : '\nAlles voldoet');
process.exit(bad ? 1 : 0);
