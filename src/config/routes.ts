import { legalPages } from '../content/legal';
import { products } from '../content/products';

/** Routes voor de sitemap. Nieuwe pagina? Voeg hem hier toe. */
export const routes: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/het-blik', priority: 0.9 },
  ...products.map((p) => ({ path: `/het-blik/${p.slug}`, priority: 0.8 })),
  { path: '/verhaal', priority: 0.8 },
  { path: '/waar-te-koop', priority: 0.9 },
  { path: '/community', priority: 0.6 },
  { path: '/faq', priority: 0.7 },
  { path: '/contact', priority: 0.6 },
  { path: '/18-plus', priority: 0.5 },
  ...Object.keys(legalPages).map((slug) => ({ path: `/juridisch/${slug}`, priority: 0.3 })),
];
