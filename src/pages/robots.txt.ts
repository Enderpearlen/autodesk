import type { APIRoute } from 'astro';
import { features } from '../config/site';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.mando-drinks.example');
  const body = features.indexable
    ? `User-agent: *\nAllow: /\nDisallow: /stijlgids\nSitemap: ${new URL('/sitemap.xml', base).href}\n`
    : `User-agent: *\nDisallow: /\n# Staat dicht tot features.indexable op true staat (zie src/config/site.ts).\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
