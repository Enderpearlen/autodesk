/**
 * Thema's van de site. Elk thema hoort bij een hero-beeld:
 *   creme = ochtend, mosterd = dag, terra = avond, nacht = nacht.
 * De kleuren worden als CSS-variabelen op <html data-theme="..."> gezet (zie themeCss).
 * Contrast wordt gecontroleerd met `npm run check:contrast`.
 */

export type ThemeId = 'creme' | 'mosterd' | 'terra' | 'nacht';
export const themeIds: ThemeId[] = ['creme', 'mosterd', 'terra', 'nacht'];

export const palette = {
  esp: '#2B1A12',
  bruin: '#A8734A',
  terra: '#C8553D',
  terraDiep: '#B04931',
  terraTekst: '#A8432D',
  mosterd: '#E3B03B',
  creme: '#EFE3C8',
  wit: '#FFF8EC',
  olijfL: '#B3B97F',
  olijf: '#8A9A5B',
  olijfD: '#5C6A3A',
  olijfDD: '#3F4A28',
  bloem: '#E2A098',
};

type Theme = {
  label: string;
  scheme: 'light' | 'dark';
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  line: string;
  band1: string;
  band1Fg: string;
  band2: string;
  band2Fg: string;
  /** Kleuren van de lopende balk onder de hero. Net als in versie 1 volgen ze het moment van de dag. */
  claimsBg: string;
  claimsFg: string;
  btnBg: string;
  btnFg: string;
  btnBorder: string;
  btnShadow: string;
  heroFg: string;
  /** Kleur van de hero-rand (reserve tijdens laden) en van het tekstblok onder de hero op telefoon. */
  heroEdge: string;
  heroCopyBg: string;
  /** Achtergrond van invoervelden. */
  field: string;
  footerBg: string;
  footerFg: string;
  /** Welke footer-afbeelding past bij dit thema. */
  footerImage: 'nacht' | 'terra' | 'creme';
  /** Welke logo-kleur staat op de paginakleur. */
  logo: 'espresso' | 'creme';
  /** Welke productafbeelding hoort bij dit thema. */
  product: 'creme' | 'mosterd' | 'terra' | 'nacht';
};

const p = palette;

/**
 * Twee vaste UI-sets. Alleen het licht of donker van de pagina verschilt, de merkkleuren (espresso,
 * terracotta, goud) en de knoppen blijven overal gelijk. Het moment van de dag bepaalt alleen de
 * beelden: hero, zon of maan, footer en productbeeld (zie `art` hieronder).
 */
export const gold = '#C9A24B';
const light = {
  scheme: 'light' as const,
  bg: p.creme, fg: p.esp, muted: '#5A4636', accent: p.terraTekst, line: p.esp,
  band1: p.mosterd, band1Fg: p.esp, band2: p.olijfDD, band2Fg: p.creme,
  btnBg: p.esp, btnFg: p.mosterd, btnBorder: p.esp, btnShadow: p.terra,
  field: p.wit, logo: 'espresso' as const,
};
const dark = {
  scheme: 'dark' as const,
  bg: p.esp, fg: p.creme, muted: '#CDBA9B', accent: p.mosterd, line: p.creme,
  band1: p.mosterd, band1Fg: p.esp, band2: p.olijfDD, band2Fg: p.creme,
  btnBg: p.mosterd, btnFg: p.esp, btnBorder: p.esp, btnShadow: p.terra,
  field: '#3A2519', logo: 'creme' as const,
};

export const themes: Record<ThemeId, Theme> = {
  creme: {
    label: 'Ochtend', ...light,
    claimsBg: p.olijfDD, claimsFg: p.creme,
    heroFg: p.esp, heroEdge: p.creme, heroCopyBg: p.creme, footerBg: p.olijfDD, footerFg: p.creme,
    footerImage: 'creme', product: 'creme',
  },
  mosterd: {
    label: 'Dag', ...light,
    claimsBg: p.mosterd, claimsFg: p.esp,
    heroFg: p.esp, heroEdge: p.mosterd, heroCopyBg: p.mosterd, footerBg: p.olijfDD, footerFg: p.creme,
    footerImage: 'creme', product: 'mosterd',
  },
  terra: {
    label: 'Avond', ...light,
    claimsBg: p.terraDiep, claimsFg: p.wit,
    heroFg: p.wit, heroEdge: p.terra, heroCopyBg: p.terraDiep, footerBg: p.esp, footerFg: p.creme,
    footerImage: 'terra', product: 'terra',
  },
  nacht: {
    label: 'Nacht', ...dark,
    claimsBg: p.mosterd, claimsFg: p.esp,
    heroFg: p.creme, heroEdge: '#2A1911', heroCopyBg: p.esp, footerBg: p.esp, footerFg: p.creme,
    footerImage: 'nacht', product: 'nacht',
  },
};

/** CSS-variabelen voor alle thema's. Wordt in <head> gezet door de basislayout. */
export function themeCss(): string {
  const rows = themeIds.map((id) => {
    const t = themes[id];
    return `html[data-theme="${id}"]{color-scheme:${t.scheme};--bg:${t.bg};--fg:${t.fg};--muted:${t.muted};--accent:${t.accent};--line:${t.line};--band1:${t.band1};--band1-fg:${t.band1Fg};--band2:${t.band2};--band2-fg:${t.band2Fg};--claims-bg:${t.claimsBg};--claims-fg:${t.claimsFg};--btn-bg:${t.btnBg};--btn-fg:${t.btnFg};--btn-border:${t.btnBorder};--btn-shadow:${t.btnShadow};--hero-fg:${t.heroFg};--hero-edge:${t.heroEdge};--hero-copy-bg:${t.heroCopyBg};--field:${t.field};--footer-bg:${t.footerBg};--footer-fg:${t.footerFg};--gold:${gold}}`;
  });
  return rows.join('\n');
}

/**
 * Tijdschema (ook gebruikt door src/scripts/theme-boot.js, dat zelfstandig moet werken):
 *  - nacht: van 45 minuten na zonsondergang tot 45 minuten voor zonsopkomst
 *  - ochtend (creme): zonsopkomst min 45 minuten tot drie uur erna
 *  - avond (terra): twee uur voor tot 45 minuten na zonsondergang
 *  - dag (mosterd): de rest
 * Locatie: midden van Nederland, zonder locatietoestemming.
 */
export const schedule = { lat: 52.1, lon: 5.3, nightAfterSunsetMin: 45, nightBeforeSunriseMin: 45, morningHours: 3, eveningHours: 2 };

export const modes = [
  { id: 'auto', label: 'Auto' },
  { id: 'dag', label: 'Dag' },
  { id: 'nacht', label: 'Nacht' },
] as const;
