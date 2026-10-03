import { defineConfig } from 'astro/config';

// Basisadres van de site (canonical-links, sitemap, deelafbeelding).
// Voorrang: SITE_URL (zet dit bij het live zetten) en daarna het adres dat Netlify zelf meegeeft
// (DEPLOY_PRIME_URL voor deze deploy, URL voor de hoofdsite), zodat een gedeelde link meteen een
// werkende deelafbeelding heeft. Zonder een van beide valt het terug op een voorbeelddomein.
const site = process.env.SITE_URL || process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://www.mando-drinks.example';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  // Het blik is de homepage geworden. Oude links blijven werken.
  redirects: { '/het-blik': '/' },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
