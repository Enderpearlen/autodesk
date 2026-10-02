/**
 * De vier smaken. Eén bron voor home, het overzicht, de productpagina's, de sitemap en de beelden.
 * Een smaak toevoegen: nieuw object, nieuwe beelden in src/config/visuals.ts (can en product).
 * Alcoholpercentage, ingrediënten en voedingswaarde van de nieuwe smaken zijn nog [X].
 */
import { X, brand } from '../config/site';
import { can, product, productOrder, type Img } from '../config/visuals';

export type Product = {
  id: 'cola' | 'cassis' | 'zero' | 'icetea';
  slug: string;
  name: string;
  /** Kort, voor kaartjes en koppen. */
  short: string;
  tagline: string;
  descriptor: string;
  /** Kleur van de smaak, voor kleine accenten. */
  accent: string;
  can: Img;
  images: Img[];
  facts: { k: string; v: string }[];
};

const abvNew = `${brand.abv} ${X('alcoholpercentage bevestigen')}`;
const common = (descriptor: string, abv: string): { k: string; v: string }[] => [
  { k: 'Inhoud', v: brand.volume },
  { k: 'Alcohol', v: abv },
  { k: 'Soort', v: descriptor },
  { k: 'Ingrediënten', v: X('ingrediëntenlijst volgens etiket') },
  { k: 'Voedingswaarde', v: X('voedingswaarde per 100 ml') },
  { k: 'Noten', v: `Bevat geen noten, alleen amandelsmaak. ${X('bevestigen met etiket en leverancier')}` },
];

export const products: Product[] = [
  {
    id: 'cola', slug: 'amaretto-cola', name: 'Amaretto Cola', short: 'Cola', accent: '#8A5A33',
    tagline: 'Amandel en cola, ijskoud.', descriptor: brand.descriptor, can: can.upright,
    images: productOrder.filter((k) => ['mosterd', 'terra', 'creme', 'nacht', 'olijf'].includes(k)).map((k) => product[k]),
    facts: common(brand.descriptor, brand.abv),
  },
  {
    id: 'cassis', slug: 'amaretto-cassis', name: 'Amaretto Cassis', short: 'Cassis', accent: '#6B2D4F',
    tagline: 'Amandel en zwarte bes.', descriptor: 'Amaretto cassis mixed drink', can: can.cassis,
    images: [product.cassis], facts: common('Amaretto cassis mixed drink', abvNew),
  },
  {
    id: 'zero', slug: 'amaretto-cola-zero', name: 'Amaretto Cola Zero', short: 'Cola Zero', accent: '#4A4540',
    tagline: `Dezelfde cola, ${X('wat Zero betekent, bijvoorbeeld zonder suiker')}.`, descriptor: 'Amaretto cola zero mixed drink', can: can.zero,
    images: [product.zero], facts: common('Amaretto cola zero mixed drink', abvNew),
  },
  {
    id: 'icetea', slug: 'amaretto-ice-tea', name: 'Amaretto Ice Tea', short: 'Ice Tea', accent: '#6E7A3A',
    tagline: 'Amandel en ijsthee, voor warme dagen.', descriptor: 'Amaretto ice tea mixed drink', can: can.icetea,
    images: [product.icetea], facts: common('Amaretto ice tea mixed drink', abvNew),
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
