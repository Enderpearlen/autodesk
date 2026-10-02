# Mando website

Merksite voor Mando, een amaretto cola in een slank blik van 250 ml (7% vol). De naam komt van *mandorlo*, het Italiaanse woord voor amandelboom. Het is een statische site (Astro 5, TypeScript, gewone CSS) met vier thema's voor de tijd van de dag, een leeftijdscontrole, een cookiebanner, formulieren en voorbereide plekken voor Instagram en TikTok.

Dit is de eerste versie. Alles is gebouwd om later te vervangen: teksten, beelden, secties en bedrijfsgegevens staan op vaste plekken in configuratiebestanden. Wat nog ontbreekt staat op de site als gele placeholder in de vorm `[X: omschrijving]`.

## Starten

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:4321
npm run build      # statische site in dist/
npm run preview    # dist/ bekijken op http://127.0.0.1:4321
```

Node 22 of nieuwer. Er is geen server nodig: `dist/` kan naar elke statische host (Netlify, Vercel, Cloudflare Pages, eigen hosting).

## Waar staat wat

| Wat je wilt aanpassen | Bestand |
|---|---|
| Vlaggen, navigatie, socials, bedrijfsgegevens, volgorde van de startpagina | `src/config/site.ts` |
| Kleuren per thema en het tijdschema voor dag en nacht | `src/config/themes.ts` |
| Alle beelden, alt-teksten en de plek van het blik in de hero | `src/config/visuals.ts` |
| Alle teksten (Nederlands) | `src/content/copy.nl.ts` |
| Veelgestelde vragen | `src/content/faq.ts` |
| Verkooppunten | `src/content/stores.ts` |
| Juridische teksten (privacy, cookies, voorwaarden, disclaimer, colofon) | `src/content/legal/legal.ts` |
| Routes voor de sitemap | `src/config/routes.ts` |
| Stijl | `src/styles/global.css` |

De beelden zelf staan in `public/visuals/`. In `docs/visuals.md` staan de formaten, de vrije tekstzones en de kleuren van de beelden. Waar elk beeld op de site wordt gebruikt, staat in het veld `usedOn` van het register en wordt getoond op `/stijlgids`.

## Beelden vervangen

Elk beeld staat in `src/config/visuals.ts` met bestand, afmetingen en alt-tekst. Vervang je een bestand, houd dan dezelfde bestandsnaam en dezelfde beeldverhouding aan, of pas de regel in het register aan. Op de heroachtergronden moet de tekstzone vrij blijven en het blik staat als los bestand (`cutouts/blik-gekanteld.webp`) bovenop. De plek van dat blik is een breuk van het beeld (`heroCan` in het register), dus een nieuwe achtergrond met dezelfde indeling werkt direct. De pagina `/stijlgids` toont alle beelden, patronen, stickers, delers en knoppen op één plek.

## Thema's: automatisch dag en nacht

Er zijn vier thema's: `creme` (ochtend), `mosterd` (dag), `terra` (avond) en `nacht`. Een klein script in de `<head>` kiest het thema vóór de eerste paint, zodat er niets flitst. Het rekent met de zonsopkomst en zonsondergang voor Nederland (vaste coördinaten, geen locatietoestemming):

- nacht: van 45 minuten na zonsondergang tot 45 minuten voor zonsopkomst
- ochtend: de eerste 3 uur na zonsopkomst
- avond: van 2 uur voor tot 45 minuten na zonsondergang
- dag: de rest

Valt de berekening uit, dan geldt een vast uurschema. Bezoekers kunnen in de header wisselen tussen Auto, Dag en Nacht; die keuze blijft bewaard. Het tijdschema pas je aan in `src/config/themes.ts` (`schedule`). Om een thema te testen: voeg `?theme=nacht` (of `creme`, `mosterd`, `terra`) toe aan een adres.

## Een sectie of pagina toevoegen

De startpagina volgt de lijst `homeSections` in `src/config/site.ts`. Een sectie verplaatsen of weghalen is een regel aanpassen. Een nieuwe sectie maak je als component in `src/components/` en voeg je toe aan die lijst en aan `src/pages/index.astro`. Een nieuwe pagina is een bestand in `src/pages/`, met `Base` als layout en `PageHeader` als kop. Zet hem ook in `src/config/routes.ts` en, als hij in het menu moet, in `nav` in `src/config/site.ts`.

## Instagram en TikTok

Footer en `/community` tonen de links naar de accounts. Vul in `socials` in `src/config/site.ts` de echte profiel-URL's in en zet `placeholder` op `false`. Voor ingesloten posts staat de lijst `socialFeed` in hetzelfde bestand: plak bij `url` de adres van een openbare Instagram-post (`https://www.instagram.com/p/...`) of TikTok-video (`https://www.tiktok.com/@account/video/...`). Zonder adres staat er een tegel met een placeholder.

De embeds zijn de officiële iframes van beide platformen en laden pas nadat de bezoeker toestemming geeft voor de categorie "Social media inhoud" in de cookiebanner. Tot dan staat er een tegel met een knop "Toon inhoud" en een gewone link. Een bezoeker kan zijn keuze opnieuw openen via "Cookie-instellingen" in de footer.

## Formulieren

Nieuwsbrief en contactformulier controleren hun invoer in het Nederlands, hebben een verborgen veld tegen spam (honeypot) en melden fouten bij het veld. Zonder verzendadres tonen ze een duidelijke demomelding en wordt er niets verstuurd. Zet voor echt gebruik een adres van een formulierdienst (bijvoorbeeld Formspree of een eigen server) in de omgevingsvariabele `PUBLIC_FORM_ENDPOINT`. Het formulier stuurt een `POST` met JSON.

## Leeftijdscontrole en cookies

De leeftijdscontrole (vlag `ageGate`) bedekt alle pagina's behalve `/18-plus`, `/leeftijd-nee`, `/juridisch` en `/stijlgids`. "Ik ben 18 of ouder" bewaart een strikt noodzakelijk cookie (`mando_age`, 30 dagen). "Nee" gaat naar `/leeftijd-nee`. De cookiebanner kent drie categorieën (noodzakelijk, statistiek, social media inhoud). Standaard staat alles uit behalve noodzakelijk; de keuze staat in `localStorage` onder `mando-consent`. Analytics is niet aangesloten (`features.analytics` staat op `false`).

## Placeholders en bedrijfsgegevens

Alles wat ik niet kon weten, zoals bedrijfsnaam, rechtsvorm, adres, KvK-nummer, btw-nummer, e-mail, telefoon, ingrediënten, voedingswaarden, accounts en verkooppunten, staat als `[X: omschrijving]`. De helper `X()` in `src/config/site.ts` maakt ze. Zoeken doe je zo:

```bash
npm run build
npm run check:placeholders   # toont alle placeholders per pagina
npm run check:live           # faalt zolang er nog een placeholder staat
```

## Controles

```bash
npm run check             # types (astro check)
npm run check:contrast    # tekstcontrast voor alle thema's
npm run test:e2e          # Playwright: routes, thema's, leeftijdscontrole, cookies, formulieren, layout, axe
npm run screens           # schermafbeeldingen maken, zie scripts/screens.mjs
```

De e2e-tests draaien op desktop (1440 bij 900) en op een telefoon. Ze bouwen de site zelf en starten de voorbeeldserver. Staat Chromium op een vaste plek, zet dan `PLAYWRIGHT_BROWSERS_PATH`.

## Live zetten

1. Vul alle placeholders in en draai `npm run check:live` tot hij slaagt.
2. Zet `features.indexable` op `true` in `src/config/site.ts`. Zolang hij op `false` staat, hebben alle pagina's `noindex` en blokkeert `robots.txt` zoekmachines.
3. Zet de omgevingsvariabele `SITE_URL` op het echte domein (voor canonical-links, sitemap en deelafbeelding) en `PUBLIC_FORM_ENDPOINT` voor de formulieren.
4. Laat een jurist de teksten in `src/content/legal/legal.ts` nalopen. Het zijn sjablonen, geen juridisch advies.
5. Test de embeds met echte posts en controleer de cookiebanner op wat er daadwerkelijk wordt geladen.

De site gaat uit van publicatie op de hoofdmap van een domein (lettertypen staan op `/fonts/...`).

## Wat nog niet af is

- De webshop is niet gebouwd. De vlag `shop` en de productgegevens zijn voorbereid, maar er is geen winkelmand. Verkoop loopt via "Waar te koop".
- Alleen Nederlands. De teksten staan in `copy.nl.ts`, zodat een tweede taalbestand erbij kan.
- De beelden zijn lokaal samengesteld en vormen een tussenversie.
