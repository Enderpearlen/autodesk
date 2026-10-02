# Mando beeldset (stoere versie)

Alleen beelden en achtergronden. Op de beelden staat alleen de tekst die op het blik zelf staat. Geen mensen. Alles staat in `public/visuals/`. De site leest ze via het register `src/config/visuals.ts`: vervang je een bestand, houd dan dezelfde naam, afmeting en vrije tekstzone aan, of pas het register aan.

Stijl: realistisch blik op een vlakke, retro poster-illustratie met grove korrel. Terracotta, mosterd, olijf en espresso. Roze komt alleen nog voor als klein accent (bloesem in de bomen).

## Kleuren

| Naam | Hex |
|---|---|
| Espresso | `#2B1A12` |
| Blikbruin | `#A8734A` |
| Terracotta | `#C8553D` |
| Mosterd | `#E3B03B` |
| Crème | `#EFE3C8` |
| Olijf licht | `#B3B97F` |
| Olijf | `#8A9A5B` |
| Olijf donker | `#5C6A3A` |
| Olijf diep | `#3F4A28` |
| Bloesem (alleen accent) | `#E2A098` |

## Composities (blik erin)

| Bestand | Maat | Vrije tekstzone |
|---|---|---|
| `hero-terra-desktop.webp` | 2048×1152 | links, x 0 tot 48 procent, y 10 tot 60 procent |
| `hero-mosterd-desktop.webp` | 2048×1152 | idem |
| `hero-creme-desktop.webp` | 2048×1152 | idem |
| `hero-nacht-desktop.webp` | 2048×1152 | links, x 0 tot 40 procent (maan staat op 50 procent) |
| `hero-*-mobiel.webp` | 1080×1920 | bovenste 12 procent; tekst over de zon mag |
| `product-*.webp` | 1600×2000 | geen tekst, blik in het midden |
| `banner-waar-te-koop.webp` | 2560×853 | links en rechts, 30 procent per kant |
| `leeftijdspoort-desktop.webp` | 1920×1080 | bovenste 15 procent en onderste 20 procent |
| `leeftijdspoort-mobiel.webp` | 1080×1920 | bovenste 12 procent en onderste 25 procent |
| `404-desktop.webp` | 2048×1152 | midden boven, naast de zon |
| `404-mobiel.webp` | 1080×1920 | bovenste 15 procent |
| `og-afbeelding.jpg` | 1200×630 | geen tekst |

## Achtergronden (zonder blik)

| Bestand | Maat | Bovenrand | Onderrand |
|---|---|---|---|
| `hero-terra-desktop.webp` | 2048×1152 | `#C8553D` | `#2A1911` |
| `hero-mosterd-desktop.webp` | 2048×1152 | `#E3B03B` | `#3E4927` |
| `hero-creme-desktop.webp` | 2048×1152 | `#EFE3C8` | `#5C6A3A` |
| `hero-nacht-desktop.webp` | 2048×1152 | `#2A1911` | `#1D110B` |
| `hero-*-mobiel.webp` | 1080×1920 | gelijk aan desktop | gelijk aan desktop |
| `banner-mosterd.webp` | 2560×853 | `#E2AF3A` | `#3F4A28` |
| `verhaal-boomgaard.webp` | 2560×1100 | `#EEE2C7` | `#3E4927` |
| `paginakop-mosterd.webp` | 2560×520 | `#E3B03B` | `#3E4927` |
| `paginakop-terra.webp` | 2560×520 | `#C8553D` | `#2B1A12` |
| `paginakop-olijf.webp` | 2560×520 | `#3F4A28` | `#2B1A12` |
| `footer-nacht.webp` | 2560×853 | `#2C1B13` | `#2B1A12` |
| `footer-terra.webp` | 2560×853 | `#C8553D` | `#2B1A12` |
| `footer-creme.webp` | 2560×853 | `#EFE3C8` | `#3F4A28` |

De onderrand van de footers is één egale kleur over de onderste ongeveer 15 procent.

## Overige onderdelen

- `cutouts/`: blik gekanteld (`blik-gekanteld.webp`, 8 graden naar rechts) en rechtop (`blik-rechtop.webp`), plus lijnschets in espresso en in crème. Transparant. De schaduw zit niet in de cutouts.
- `stickers/`: amandel, gestreepte zon, cipres, amandelboom, embleem. Transparant, 600×600.
- `patronen/`: terrazzo, strepen, amandelen. Naadloze tegels van 1024×1024.
- `delers/`: heuvelrand in vijf vormen, 2560×300, transparant. De site gebruikt ze als masker, dus de kleur volgt het thema.
- `logo/`: `logo-espresso` voor lichte vlakken, `logo-creme` voor donkere. Ook `teken-*`, `woordmerk-espresso.svg` en favicons (32, 48, 180, 512).

## Status

Versie 2. Het blik komt uit Jarno's eigen ontwerp (screenshot van 662 px), met Topaz tot 1324 px opgeschaald en lokaal schoon uitgeknipt. De smaken (cassis, cola zero, ice tea) zijn digitale herkleuringen van dat blik met een nieuw etiketopschrift, een gouden kader en de zijkanttekst "Bevat geen noten, alleen amandelsmaak" (nog te bevestigen met etiket en leverancier). Het merkteken (amandel) is een schone hertekening van het amandelpatroon op het blik. Het houten vat en de aardewerken pot zijn eigen tekeningen in dezelfde vlakke stijl. Product, deelafbeelding, leeftijdscontrole en 404 hebben een gouden dubbele binnenlijn.

Nog te doen met de beeldgenerator of fotografie: echte productfoto's per smaak, een rijkere set achtergronden en een macro van de bovenkant van het blik.
