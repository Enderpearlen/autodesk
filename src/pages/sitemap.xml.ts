import type { APIRoute } from 'astro';
import { routes } from '../config/routes';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.mando-drinks.example');
  const urls = routes.map((r) => `  <url><loc>${new URL(r.path, base).href}</loc><priority>${r.priority}</priority></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
};
