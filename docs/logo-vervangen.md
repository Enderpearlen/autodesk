# Het definitieve logo en tabblad-icoon vervangen

Alle logo's komen uit één map, `public/visuals/logo/`, en worden aangestuurd door `logo` in `src/config/visuals.ts`. Het huidige merkteken (de amandel) en woordmerk zijn voorlopig. Vervangen gaat met één commando.

## Wat je nodig hebt

- Het logo of woordmerk in een donkere kleur (voor de lichte pagina), als SVG of als PNG met transparante achtergrond.
- Hetzelfde in een lichte kleur (voor de donkere pagina en de footer). Zonder dit bestand wordt het donkere logo ook voor donker gebruikt, dus dan is het onzichtbaar op espresso. Lever ze dus allebei aan.
- Het losse merkteken (het icoon) donker en licht. Dit wordt het tabblad-icoon en het icoon op de telefoon.

## Het commando

```
node scripts/logo-set.mjs \
  --logo=pad/logo-donker.svg --logo-light=pad/logo-licht.svg \
  --mark=pad/teken-donker.svg --mark-light=pad/teken-licht.svg
npm run build
```

Het script schrijft `logo-espresso`, `logo-creme`, `teken-espresso`, `teken-creme` (svg en png) en `favicon-32/48/180/512.png` naar `public/visuals/logo/`, en zet de afmeting van het logo in `src/config/visuals.ts` goed. Daarna bekijk je header, footer, het tabblad en `/stijlgids`.

## Waar ze gebruikt worden

| Bestand | Waar |
| --- | --- |
| `logo-espresso.svg` | header op lichte pagina |
| `logo-creme.svg` | header op de donkere pagina, footer |
| `teken-espresso.svg` | tabblad-icoon (SVG) |
| `teken-creme.svg` | losse toepassingen van het teken |
| `favicon-32.png`, `favicon-48.png` | tabblad-icoon |
| `favicon-180.png` | icoon op het beginscherm van iPhone |
| `favicon-512.png` | manifest, structured data (logo van de organisatie) |

De amandel in de lopende balk onder de hero (`stickers/amandel-claims.webp`) en de amandel als sticker (`stickers/amandel.webp`) zijn losse illustraties en staan los van het logo. Wil je daar ook je definitieve amandel, vervang die bestanden dan met dezelfde naam en maat (600 x 600, transparant).

## Beelden met het logo erin

Het blik op de hero's, productbeelden en deelafbeelding is een eigen illustratie en wordt niet door dit script aangepast. Als het blikontwerp verandert, moeten die beelden opnieuw gemaakt worden (zie `docs/visuals.md`).
