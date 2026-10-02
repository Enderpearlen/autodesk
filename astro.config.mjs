import { defineConfig } from 'astro/config';

// SITE_URL: zet dit bij het live zetten (bijvoorbeeld in Vercel of Netlify).
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.mando-drinks.example',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
