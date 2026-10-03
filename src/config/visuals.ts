/**
 * Register van alle beelden. Componenten lezen paden hier vandaan, nooit hard in de markup.
 * Een beeld vervangen: zet het nieuwe bestand in public/visuals en pas hier pad, afmeting of alt aan.
 * De stijlgids (/stijlgids) toont alles uit dit register.
 */
import type { ThemeId } from './themes';

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const path = (p: string) => `${base}/visuals/${p}`;

export type Img = { src: string; w: number; h: number; alt: string; usedOn: string };
const img = (p: string, w: number, h: number, alt: string, usedOn: string): Img => ({ src: path(p), w, h, alt, usedOn });

const themeIds: ThemeId[] = ['creme', 'mosterd', 'terra', 'nacht'];

const themeLabels: Record<ThemeId, string> = {
  creme: 'ochtend',
  mosterd: 'dag',
  terra: 'avond',
  nacht: 'nacht',
};

/** Achtergrond van de hero, per thema en schermvorm. Decoratief (alt leeg), het blik staat los erboven. */
export const heroBg = Object.fromEntries(
  themeIds.map((t) => [
    t,
    {
      desktop: img(`achtergronden/hero-${t}-desktop.webp`, 2048, 1152, '', `Hero (${themeLabels[t]}), desktop`),
      mobile: img(`achtergronden/hero-${t}-mobiel.webp`, 1080, 1920, '', `Hero (${themeLabels[t]}), telefoon`),
    },
  ]),
) as Record<ThemeId, { desktop: Img; mobile: Img }>;

/**
 * Plek van het blik in de hero, als fractie van het vaste hero-vlak (16:9 of 9:16).
 * Komt overeen met de samengestelde composities. Pas aan als je een nieuw hero-beeld maakt.
 */
export const heroCan = {
  desktop: { cx: 0.69, bottom: 0.9115, h: 0.7465 },
  mobile: { cx: 0.5, bottom: 0.8854, h: 0.5208 },
};

export const can = {
  tilt: img('cutouts/blik-gekanteld.webp', 527, 984, 'Mando amaretto cola blik, 250 ml', 'Hero, blik als los element'),
  upright: img('cutouts/blik-rechtop.webp', 373, 989, 'Mando amaretto cola blik, rechtop', 'Smaken en productpagina, Amaretto Cola'),
  cassis: img('cutouts/blik-cassis.webp', 373, 989, 'Mando amaretto cassis blik, rechtop', 'Smaken en productpagina, Amaretto Cassis'),
  zero: img('cutouts/blik-zero.webp', 373, 989, 'Mando amaretto cola zero blik, rechtop', 'Smaken en productpagina, Amaretto Cola Zero'),
  icetea: img('cutouts/blik-icetea.webp', 373, 989, 'Mando amaretto ice tea blik, rechtop', 'Smaken en productpagina, Amaretto Ice Tea'),
  sketchDark: img('cutouts/lijnschets-espresso.webp', 534, 1100, '', 'Het blik en Verhaal, lijnschets'),
  sketchLight: img('cutouts/lijnschets-creme.webp', 534, 1100, '', 'Het blik, lijnschets op donker'),
};

/** Productbeelden (4:5). Het eerste per thema wordt op Home getoond, alle vijf in de galerij. */
export const product = {
  creme: img('composities/product-creme.webp', 1600, 2000, 'Mando blik voor een rode zon op een crème achtergrond', 'Home en Het blik'),
  mosterd: img('composities/product-mosterd.webp', 1600, 2000, 'Mando blik voor een rode zon op een gele achtergrond', 'Home en Het blik'),
  terra: img('composities/product-terra.webp', 1600, 2000, 'Mando blik met een lijnschets voor een gele zon op terracotta', 'Home en Het blik'),
  nacht: img('composities/product-nacht.webp', 1600, 2000, 'Mando blik voor een gele maan op een donkere achtergrond', 'Home en Het blik'),
  olijf: img('composities/product-olijf.webp', 1600, 2000, 'Mando blik voor een crème zon op een olijfgroene achtergrond', 'Het blik, galerij'),
  cassis: img('composities/product-cassis.webp', 1600, 2000, 'Mando Amaretto Cassis blik voor een gele zon op een pruimkleurige achtergrond', 'Productpagina Amaretto Cassis'),
  zero: img('composities/product-zero.webp', 1600, 2000, 'Mando Amaretto Cola Zero blik voor een crème zon op een donkergrijze achtergrond', 'Productpagina Amaretto Cola Zero'),
  icetea: img('composities/product-icetea.webp', 1600, 2000, 'Mando Amaretto Ice Tea blik voor een gele zon op een lichtgroene achtergrond', 'Productpagina Amaretto Ice Tea'),
};

/** Alle vier de smaken naast elkaar, voor de homepage en het overzicht. */
export const lineup = img('composities/lineup-smaken.webp', 2560, 1100, 'Vier Mando blikken naast elkaar: cola, cassis, cola zero en ice tea, tussen een houten vat en een aardewerken pot', 'Home (smaken) en Het blik (overzicht)');
/** Alleen Amaretto Cola, voor zolang de andere smaken nog niet beschikbaar zijn. */
export const lineupCola = img('composities/lineup-cola.webp', 2560, 1100, 'Een Mando Amaretto Cola blik voor een rode zon, tussen een houten vat en een aardewerken pot', 'Home (smaken)');
export const productOrder: (keyof typeof product)[] = ['mosterd', 'terra', 'creme', 'nacht', 'olijf'];

export const banner = {
  composite: img('composities/banner-waar-te-koop.webp', 2560, 853, 'Drie Mando blikken voor een rode zon op een gele achtergrond', 'Home en Waar te koop'),
  bg: img('achtergronden/banner-mosterd.webp', 2560, 853, '', 'Stijlgids, achtergrond zonder blikken'),
};

export const story = img('achtergronden/verhaal-boomgaard.webp', 2560, 1100, '', 'Home (verhaal) en Verhaal');

export const pageHeader = {
  mosterd: img('achtergronden/paginakop-mosterd.webp', 2560, 520, '', 'Paginakop: Het blik, FAQ'),
  terra: img('achtergronden/paginakop-terra.webp', 2560, 520, '', 'Paginakop: Verhaal, Contact'),
  olijf: img('achtergronden/paginakop-olijf.webp', 2560, 520, '', 'Paginakop: Community, juridisch'),
};

export const footer = {
  nacht: img('achtergronden/footer-nacht.webp', 2560, 853, '', 'Footer bij nacht'),
  terra: img('achtergronden/footer-terra.webp', 2560, 853, '', 'Footer bij avond'),
  creme: img('achtergronden/footer-creme.webp', 2560, 853, '', 'Footer bij ochtend en dag'),
};

export const ageGate = {
  desktop: img('composities/leeftijdspoort-desktop.webp', 1920, 1080, '', 'Leeftijdscontrole, desktop'),
  mobile: img('composities/leeftijdspoort-mobiel.webp', 1080, 1920, '', 'Leeftijdscontrole, telefoon'),
};

export const notFound = {
  desktop: img('composities/404-desktop.webp', 2048, 1152, 'Een Mando blik ligt op zijn kant in het gras onder een amandelboom', '404, desktop'),
  mobile: img('composities/404-mobiel.webp', 1080, 1920, 'Een Mando blik ligt op zijn kant in het gras onder een amandelboom', '404, telefoon'),
};

/** Heuvelranden. De site gebruikt ze als masker, zodat de kleur het thema volgt. */
export const dividers = [
  img('delers/deler-olijf.webp', 2560, 300, '', 'Overgang tussen secties (vorm 1)'),
  img('delers/deler-terracotta.webp', 2560, 300, '', 'Overgang tussen secties (vorm 2)'),
  img('delers/deler-creme.webp', 2560, 300, '', 'Overgang tussen secties (vorm 3)'),
  img('delers/deler-espresso.webp', 2560, 300, '', 'Overgang tussen secties (vorm 4)'),
  img('delers/deler-mosterd.webp', 2560, 300, '', 'Overgang tussen secties (vorm 5)'),
];

export const patterns = {
  terrazzo: img('patronen/patroon-terrazzo.webp', 1024, 1024, '', 'Nieuwsbriefband'),
  strepen: img('patronen/patroon-strepen.webp', 1024, 1024, '', 'Strepen boven en onder de claimstrook'),
  amandelen: img('patronen/patroon-amandelen.webp', 1024, 1024, '', 'Community en Home, communityband'),
};

export const stickers = {
  amandel: img('stickers/amandel.webp', 600, 600, '', 'Merkteken-amandel, los gebruik'),
  amandelClaims: img('stickers/amandel-claims.webp', 600, 600, '', 'Home, claimstrook (amandel uit versie 1)'),
  zon: img('stickers/zon-gestreept.webp', 600, 600, '', 'Home, het blik, Verhaal'),
  cipres: img('stickers/cipres.webp', 600, 600, '', 'Verhaal, Waar te koop'),
  boom: img('stickers/amandelboom.webp', 600, 600, '', 'Verhaal, Community'),
  embleem: img('stickers/embleem.webp', 600, 600, '', 'Leeftijdscontrole, footer, Contact'),
  vat: img('stickers/vat.webp', 600, 600, '', 'Home (smaken), Verhaal'),
  pot: img('stickers/pot.webp', 600, 600, '', 'Home (smaken), Het blik'),
};

export const logo = {
  dark: { src: path('logo/logo-espresso.svg'), alt: 'Mando', w: 480, h: 120 },
  light: { src: path('logo/logo-creme.svg'), alt: 'Mando', w: 480, h: 120 },
  markDark: path('logo/teken-espresso.svg'),
  markLight: path('logo/teken-creme.svg'),
  favicon: { svg: path('logo/teken-espresso.svg'), png32: path('logo/favicon-32.png'), png48: path('logo/favicon-48.png'), apple: path('logo/favicon-180.png'), png512: path('logo/favicon-512.png') },
};

export const og = img('composities/og-afbeelding.jpg', 1200, 630, 'Mando blik naast een amandelboom', 'Deelafbeelding op social media');

/** Voor de stijlgids: alles in één lijst, gegroepeerd. */
export const catalogue: { group: string; items: Img[] }[] = [
  { group: 'Hero achtergronden', items: themeIds.flatMap((t) => [heroBg[t].desktop, heroBg[t].mobile]) },
  { group: 'Blik en schetsen', items: Object.values(can) },
  { group: 'Productbeelden', items: Object.values(product) },
  { group: 'Banner en verhaal', items: [banner.composite, banner.bg, story, lineup, lineupCola] },
  { group: 'Paginakoppen', items: Object.values(pageHeader) },
  { group: 'Footers', items: Object.values(footer) },
  { group: 'Leeftijdscontrole en 404', items: [ageGate.desktop, ageGate.mobile, notFound.desktop, notFound.mobile] },
  { group: 'Delers (als masker)', items: dividers },
  { group: 'Patronen', items: Object.values(patterns) },
  { group: 'Stickers', items: Object.values(stickers) },
  { group: 'Deelafbeelding', items: [og] },
];
