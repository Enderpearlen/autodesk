# Mando beeldset

Alleen beelden en achtergronden. Geen navigatie, knoppen of kopteksten: die komen later in code. Op de beelden staat alleen de tekst die op het blik zelf staat.

Stijl: realistisch blik op een vlakke poster-illustratie met papierkorrel. Geen mensen.

## Kleuren

| Naam | Hex |
|---|---|
| Espresso | `#3B241A` |
| Blikbruin | `#A8734A` |
| Amandelbloesem | `#F2B8C6` |
| Terracotta | `#D8643F` |
| Botergeel | `#F6D56B` |
| Crème | `#FFF4E4` |
| Salie | `#9DAA6B` |

## Bestanden

### composities (blik erin)

| Bestand | Maat | Sectie | Vrije tekstzone | Alt-tekst |
|---|---|---|---|---|
| `hero-desktop.webp` | 2048×1152 | Hero | links, ongeveer x 0 tot 52 procent, y 8 tot 58 procent | Mando amaretto cola blik voor een Italiaans heuvellandschap met een amandelboom in bloei |
| `hero-mobiel.webp` | 1080×1920 | Hero (telefoon) | bovenste 18 procent over de volle breedte, daaronder de linkerstrook (24 procent) | Mando blik naast een amandelboom in bloei, met heuvels en een dorpje op de achtergrond |
| `het-blik.webp` | 2048×1152 | Het blik | bovenste 16 procent, en de zijkanten (links en rechts 25 procent) | Mando blik voor een grote terracotta zon, met een lijnschets van het blik ernaast |
| `banner-waar-te-koop.webp` | 2560×853 | Waar te koop | links 33 procent en rechts 33 procent, bovenste 20 procent | Drie Mando blikken op een gele achtergrond met lage groene heuvels |
| `og-afbeelding.jpg` | 1200×630 | Delen op social | niet bedoeld voor tekst | Mando blik naast een amandelboom in bloei |

### achtergronden (zonder blik, voor eigen compositie of parallax)

| Bestand | Maat | Boven- en onderrand | Opmerking |
|---|---|---|---|
| `hero-desktop-achtergrond.webp` | 2048×1152 | boven `#FDEFCE`, onder `#A7A568` | linksboven en links midden vrij voor een grote kop |
| `het-blik-achtergrond.webp` | 2048×1152 | boven `#F2B8C6`, onder `#7B8A51` | midden leeg voor het blik |
| `banner-achtergrond.webp` | 2560×853 | boven `#F6D56B`, onder `#7C8B52` | midden leeg voor drie blikken |
| `footer-strook.webp` | 2560×853 | boven `#F2B8C6`, onder `#5D6A39` | onderste 18 procent is één egale kleur, de footer kan er in dezelfde kleur op doorgaan |

### cutouts (transparant)

| Bestand | Maat | Gebruik |
|---|---|---|
| `blik-gekanteld.webp` | 528×1100 | blik zoals in de hero, 8 graden naar rechts gekanteld |
| `blik-rechtop.webp` | 419×1108 | blik rechtop |
| `lijnschets-blik.webp` | 533×1100 | lijnschets in espresso, 8 graden naar links, voor spaarzaam gebruik |

## Tips voor de code

- Zet het blik als los element op de achtergrond voor een lichte zweef- of parallax-beweging. De schaduw zit in de composities, niet in de cutouts.
- Gebruik de randkleuren hierboven als achtergrondkleur van de sectie erboven of eronder, dan loopt het naadloos door.
- Het bestandsformaat is WebP. Alle bestanden zijn kleiner dan 250 KB.

## Status

Definitief: `hero-desktop-achtergrond.webp`.

Voorlopig, nog te vervangen of te verbeteren:

- De blikken komen uit één bronbeeld van 1280×720 en zijn opgeschaald, daardoor iets zacht. Vervangen zodra een 2K-versie beschikbaar is.
- `hero-mobiel.webp` is een uitsnede van de desktop-hero, geen apart ontworpen beeld.
- De achtergronden voor het blik, de banner en de footer zijn vlak getekend. Ze passen bij het hero-landschap, maar zijn minder rijk. Gegenereerde versies staan klaar om te draaien zodra de beeldlimiet gereset is.
- Nog niet gemaakt: brede amandelboomgaard voor het verhaal, losse bloesemtak en boom als overlay, stilleven met amandelen en ijs, macro van de bovenkant van het blik.
