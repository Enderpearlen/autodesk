/**
 * Alle teksten van de site (Nederlands). Voor een tweede taal: kopieer dit bestand naar copy.en.ts
 * en laat `src/content/index.ts` op basis van de taal kiezen.
 * Placeholders staan als [X: omschrijving] en worden automatisch gemarkeerd.
 */
import { X, brand } from '../config/site';

export const copy = {
  meta: {
    siteName: 'Mando',
    titleSuffix: ' | Mando amaretto cola',
    defaultDescription:
      'Mando is amaretto cola in een slank blik van 250 ml, 7% vol. Vernoemd naar mandorla, het Italiaanse woord voor amandel. Alleen voor 18+.',
  },

  announcement: {
    label: 'Mededeling',
    close: 'Sluit mededeling',
  },

  quote: {
    text: 'Van en voor de echte genieters',
  },

  reviews: {
    title: 'Wat genieters zeggen',
    note: 'Dit zijn voorbeeldreviews. Echte reviews komen na de lancering.',
    tag: 'Voorbeeldreview',
    outOf: 'van 5 sterren',
  },

  ui: {
    skip: 'Naar de inhoud',
    menu: 'Menu',
    menuClose: 'Sluit menu',
    themeLabel: 'Kleurthema',
    themeAuto: 'Automatisch (volgt de zon)',
    themeDay: 'Dag',
    themeNight: 'Nacht',
    themeNow: 'Nu',
    home: 'Naar de homepage',
    readMore: 'Lees verder',
    backHome: 'Terug naar home',
    required: 'Verplicht',
    send: 'Versturen',
    sending: 'Bezig met versturen',
    close: 'Sluiten',
    showContent: 'Toon inhoud',
    opensNewTab: 'opent in een nieuw tabblad',
  },

  hero: {
    title: 'Amandel en cola. Ijskoud.',
    lead: `Mando is vernoemd naar ${brand.origin}, het Italiaanse woord voor ${brand.originMeaning}. Amaretto en cola in een slank blik van ${brand.volume}.`,
    primary: 'Waar te koop',
    secondary: 'Het blik',
    note: `${brand.abv}. Alleen voor 18+.`,
    canAlt: `${brand.product}, ${brand.volume}`,
  },

  claims: ['Amaretto cola', brand.volume, brand.abv, 'Mandorla betekent amandel', 'Alleen voor 18+'],

  product: {
    title: 'Het blik',
    text: `Slank, ${brand.volume} en het lekkerst ijskoud. Amaretto en cola, zonder gedoe.`,
    factsTitle: 'In het kort',
    /** Op de homepage alleen de korte feiten. Ingrediënten en voedingswaarde staan op de productpagina. */
    factsShort: [
      { k: 'Inhoud', v: brand.volume },
      { k: 'Alcohol', v: brand.abv },
      { k: 'Soort', v: brand.descriptor },
    ],
    facts: [
      { k: 'Inhoud', v: brand.volume },
      { k: 'Alcohol', v: brand.abv },
      { k: 'Soort', v: brand.descriptor },
      { k: 'Ingrediënten', v: X('ingrediëntenlijst volgens etiket') },
      { k: 'Voedingswaarde', v: X('voedingswaarde per 100 ml') },
    ],
    cta: 'Bekijk het blik',
    ctaWhere: 'Waar te koop',
  },

  story: {
    title: 'Mandorla',
    text: 'Mando komt van mandorla, het Italiaanse woord voor amandel. De amandelboom bloeit al vroeg in het jaar, tussen heuvels vol zon. Dat landschap willen we in elk blik.',
    cta: 'Lees het verhaal',
  },

  where: {
    title: 'Waar te koop',
    text: 'Zoek een verkooppunt bij jou in de buurt.',
    online: `Online bestellen: ${X('webshop of partner')}`,
    cta: 'Zoek een verkooppunt',
  },

  community: {
    title: 'Volg Mando',
    text: 'Nieuw, foto’s en video’s. Op Instagram en TikTok.',
    followInstagram: 'Volg op Instagram',
    followTikTok: 'Volg op TikTok',
    allPosts: 'Alle posts',
  },

  newsletter: {
    title: 'Blijf op de hoogte',
    text: 'Eén mail als er iets nieuws is. Geen spam en altijd uit te schrijven.',
    email: 'E-mailadres',
    consentPre: 'Ik wil de nieuwsbrief ontvangen en ga akkoord met de ',
    consentLink: 'privacyverklaring',
    consentPost: '.',
    age: 'Ik ben 18 jaar of ouder.',
    submit: 'Aanmelden',
    ok: 'Gelukt. Je staat op de lijst.',
    demo: 'Demo: er is nog geen formulierdienst gekoppeld, dus er is niets verstuurd.',
  },

  pages: {
    product: {
      title: 'Het blik',
      description: `${brand.product}: amaretto cola in een slank blik van ${brand.volume}, ${brand.abv}.`,
      lead: 'Mando Amaretto Cola. Amaretto en cola in een slank blik.',
      galleryLabel: 'Productbeelden',
      thumb: 'Toon beeld',
      serving: 'Serveren en bewaren',
      servingText: X('serveertip en bewaaradvies'),
      allergens: 'Allergenen',
      allergensText: X('allergeneninformatie volgens etiket'),
      warning: 'Bevat alcohol. Geniet met mate. Niet voor personen onder de 18 jaar. Niet drinken tijdens zwangerschap of als je moet rijden.',
    },
    story: {
      title: 'Het verhaal',
      description: 'Mando komt van mandorla, het Italiaanse woord voor amandel. Lees waar de naam en het blik vandaan komen.',
      lead: 'Een naam met een boom erin.',
      blocks: [
        {
          h: 'Waar de naam vandaan komt',
          p: [
            'Mando komt van mandorla. Dat is Italiaans voor amandel.',
            'Amaretto staat bekend om zijn amandelsmaak. Mando brengt die smaak bij elkaar met cola, in een slank blik van 250 ml.',
          ],
        },
        {
          h: 'Het landschap',
          p: ['Amandelbomen groeien in warme streken en bloeien vroeg in het jaar. Op het blik en op deze site zie je dat landschap terug: heuvels, cipressen en een zon die nooit helemaal ondergaat.'],
        },
        {
          h: 'Wie zit er achter Mando',
          p: [X('verhaal van de oprichters en waarom Mando er is')],
        },
      ],
      cta: 'Waar te koop',
    },
    where: {
      title: 'Waar te koop',
      description: 'Vind een verkooppunt van Mando amaretto cola. Filter op type en zoek op naam of plaats.',
      lead: 'Online en in de winkel. De lijst wordt aangevuld.',
      search: 'Zoek op naam of plaats',
      filter: 'Type verkooppunt',
      all: 'Alles',
      types: { online: 'Online', supermarkt: 'Supermarkt', slijterij: 'Slijterij', horeca: 'Horeca' },
      empty: 'Geen verkooppunten gevonden. Probeer een andere zoekterm of filter.',
      count: (n: number) => (n === 1 ? '1 verkooppunt' : `${n} verkooppunten`),
      route: 'Route',
      visit: 'Website',
      add: `Verkooppunt toevoegen of een fout melden? ${X('contactgegevens voor verkooppunten')}`,
    },
    community: {
      title: 'Community',
      description: 'Volg Mando op Instagram en TikTok.',
      lead: 'Wat er gebeurt rond Mando.',
      embedNote: 'Voor Instagram en TikTok laden we pas inhoud van die partijen nadat je toestemming geeft.',
      hashtag: 'Deel jouw foto met',
    },
    faq: {
      title: 'Veelgestelde vragen',
      description: 'Antwoorden op vragen over Mando amaretto cola: ingrediënten, alcohol, leeftijd en waar te koop.',
      lead: 'Staat je vraag er niet bij? Stuur ons een bericht.',
      contactCta: 'Stel je vraag',
    },
    contact: {
      title: 'Contact',
      description: 'Neem contact op met Mando voor vragen, samenwerking of een verkooppunt.',
      lead: 'Een vraag, een idee of een verkooppunt? Laat het weten.',
      name: 'Naam',
      email: 'E-mailadres',
      subject: 'Onderwerp',
      subjects: ['Vraag over het product', 'Verkooppunt of samenwerking', 'Pers', 'Iets anders'],
      message: 'Bericht',
      consentPre: 'Ik ga akkoord met de ',
      consentLink: 'privacyverklaring',
      consentPost: '.',
      ok: 'Bedankt voor je bericht. We reageren zo snel mogelijk.',
      demo: 'Demo: er is nog geen formulierdienst gekoppeld, dus je bericht is niet verstuurd.',
      detailsTitle: 'Gegevens',
    },
    adult: {
      title: 'Verantwoord drinken',
      description: 'Mando bevat alcohol en is alleen voor mensen van 18 jaar en ouder. Lees hoe je verantwoord geniet.',
      lead: `Mando bevat alcohol (${brand.abv}). Alleen voor 18+.`,
      points: [
        'Geen alcohol onder de 18 jaar. Wij vragen bij elk bezoek en bij elke levering naar je leeftijd.',
        'Geniet met mate. Een blik is een moment, geen wedstrijd.',
        'Rij niet onder invloed.',
        'Zwanger of wil je zwanger worden? Drink dan geen alcohol.',
      ],
      moreTitle: 'Meer informatie',
      links: [
        { href: 'https://www.nix18.nl/', label: 'NIX18' },
        { href: 'https://www.stiva.nl/', label: 'STIVA, Stichting Verantwoordelijk Alcoholgebruik' },
      ],
    },
    ageNo: {
      title: 'Helaas, nog even wachten',
      description: 'Mando is alleen voor mensen van 18 jaar en ouder.',
      text: 'Mando bevat alcohol en is alleen voor 18+. Kom terug als je 18 bent.',
      more: 'Meer over verantwoord drinken',
    },
    notFound: {
      title: 'Dit blik is omgevallen',
      description: 'Deze pagina bestaat niet.',
      text: 'De pagina die je zoekt bestaat niet (meer). Zet het blik weer overeind en ga terug naar de homepage.',
      cta: 'Terug naar home',
    },
    legal: {
      updated: 'Laatst bijgewerkt',
      draftNote:
        'Dit is een conceptversie met placeholders. Laat de teksten nalopen door een bevoegde persoon voordat de site live gaat.',
    },
    styleguide: {
      title: 'Stijlgids',
      description: 'Intern overzicht van beelden, kleuren en onderdelen.',
    },
  },

  ageGate: {
    title: 'Ben je 18 of ouder?',
    text: `Mando bevat alcohol (${brand.abv}) en is alleen voor mensen van 18 jaar en ouder.`,
    yes: 'Ja, ik ben 18 of ouder',
    no: 'Nee',
    why: 'Waarom vragen we dit?',
    remember: 'We onthouden je keuze 30 dagen in een noodzakelijk cookie.',
    noscript: 'Mando bevat alcohol en is alleen voor mensen van 18 jaar en ouder.',
  },

  consent: {
    title: 'Cookies en inhoud van derden',
    text: 'We gebruiken alleen wat nodig is om de site te laten werken. Voor Instagram en TikTok inhoud en statistiek vragen we eerst toestemming.',
    necessary: 'Noodzakelijk',
    necessaryText: 'Leeftijdscontrole, thema en je keuze hier. Altijd aan.',
    stats: 'Statistiek',
    statsText: 'Anoniem meten hoe de site wordt gebruikt. Nu nog niet in gebruik.',
    social: 'Social media inhoud',
    socialText: 'Posts van Instagram en TikTok tonen. Die partijen kunnen dan cookies plaatsen.',
    acceptAll: 'Alles toestaan',
    rejectAll: 'Alleen noodzakelijk',
    save: 'Keuze opslaan',
    settings: 'Cookie-instellingen',
    more: 'Meer in onze cookieverklaring',
  },

  embed: {
    placeholderFor: (platform: string) => `Hier komt inhoud van ${platform}.`,
    blocked: (platform: string) => `Om ${platform} te tonen is toestemming nodig voor inhoud van derden.`,
    show: 'Toon inhoud',
    openOn: (platform: string) => `Open op ${platform}`,
    missing: 'Hier komt een post',
  },

  forms: {
    errors: {
      required: 'Vul dit veld in.',
      email: 'Vul een geldig e-mailadres in.',
      consent: 'Je moet hiermee akkoord gaan om verder te gaan.',
      generic: 'Er ging iets mis. Probeer het later opnieuw.',
    },
    summary: 'Controleer de gemarkeerde velden.',
    mailtoText: 'Of mail ons direct',
  },

  footer: {
    tagline: 'Amaretto cola. Vernoemd naar de amandel.',
    warning: `Bevat alcohol (${brand.abv}). Geniet met mate. Alleen voor 18+.`,
    rights: 'Alle rechten voorbehouden.',
    help: 'Hulp',
    legal: 'Juridisch',
    follow: 'Volg',
    madeWith: 'Jost is een lettertype onder de SIL Open Font License.',
  },
};

export type Copy = typeof copy;
