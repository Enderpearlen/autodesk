import { X, brand } from '../config/site';

export type Faq = { q: string; a: string };

export const faq: Faq[] = [
  {
    q: 'Wat is Mando?',
    a: `Mando is een amaretto cola mixed drink in een slank blik van ${brand.volume}, met ${brand.abv} alcohol. De naam komt van ${brand.origin}, het Italiaanse woord voor ${brand.originMeaning}.`,
  },
  {
    q: 'Bevat Mando alcohol?',
    a: `Ja. Mando heeft ${brand.abv} alcohol en is alleen voor mensen van 18 jaar en ouder.`,
  },
  {
    q: 'Wat zit er in een blik?',
    a: `Ingrediënten: ${X('ingrediëntenlijst volgens etiket')}. Allergenen: ${X('allergeneninformatie volgens etiket')}.`,
  },
  {
    q: 'Hoe serveer ik Mando?',
    a: `Het lekkerst ijskoud. ${X('serveertip, bijvoorbeeld met ijs of een schijfje sinaasappel')}`,
  },
  {
    q: 'Hoe lang is Mando houdbaar?',
    a: `Zie de datum op het blik. Bewaaradvies: ${X('bewaaradvies')}.`,
  },
  {
    q: 'Waar kan ik Mando kopen?',
    a: 'Mando is binnenkort verkrijgbaar. Op de pagina Waar te koop komen de verkooppunten te staan zodra ze bekend zijn.',
  },
  {
    q: 'Kan ik als verkooppunt Mando verkopen?',
    a: `Ja, graag. Vul het formulier Voor bedrijven in op de contactpagina. ${X('voorwaarden of minimale afname voor verkooppunten')}`,
  },
  {
    q: 'Waarom vragen jullie mijn leeftijd?',
    a: 'Mando bevat alcohol en is alleen voor 18+. Daarom vragen we je bij je eerste bezoek of je 18 bent. We onthouden je keuze 30 dagen in een noodzakelijk cookie.',
  },
];
