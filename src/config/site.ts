/**
 * Centrale instellingen van de Mando site.
 * Hier pas je merkgegevens, navigatie, vlaggen, socials en bedrijfsgegevens aan.
 *
 * Alles wat nog moet worden ingevuld staat als placeholder: [X: omschrijving].
 * Zoek ze allemaal met `npm run check:placeholders`.
 */

/** Maakt een zichtbare placeholder. */
export const X = (wat: string) => `[X: ${wat}]`;

/** Vlaggen: zet onderdelen aan of uit zonder code te wijzigen. */
export const features = {
  /** Webshop is nog niet gebouwd. De structuur (productdata, route) is voorbereid. */
  shop: false,
  /** Leeftijdscontrole (18+) over alle pagina's behalve de vrijgestelde. */
  ageGate: true,
  /** Instagram en TikTok embeds (pas na toestemming). */
  socialEmbeds: true,
  /** Analytics. Staat uit tot er een tool is gekozen. */
  analytics: false,
  /** Zet op true bij de launch, nadat alle placeholders zijn ingevuld (`npm run check:live`). */
  indexable: false,
  /** Automatisch dag en nacht volgen. */
  themeAuto: true,
  languages: ['nl'] as const,
};

export const brand = {
  name: 'Mando',
  product: 'Mando Amaretto Cola',
  descriptor: 'Amaretto cola mixed drink',
  volume: '250 ml',
  abv: '7% vol',
  /** Betekenis van de naam. */
  origin: 'mandorla',
  originMeaning: 'amandel',
  locale: 'nl-NL',
};

/** Bedrijfsgegevens, zichtbaar in footer, contact, colofon en privacyverklaring. */
export const company = {
  legalName: X('bedrijfsnaam'),
  legalForm: X('rechtsvorm'),
  address: X('vestigingsadres'),
  postalCode: X('postcode en plaats'),
  kvk: X('KvK-nummer'),
  vat: X('btw-identificatienummer'),
  email: X('e-mailadres'),
  phone: X('telefoonnummer'),
  /** Alleen invullen als Mando zelf alcohol verkoopt of levert (Alcoholwet). */
  alcoholLicense: X('vergunning of ontheffing Alcoholwet, indien van toepassing'),
  responseTime: X('reactietijd, bijvoorbeeld binnen 2 werkdagen'),
};

/** Eén bron voor navigatie: header, footer en mobiel menu lezen hieruit. */
export const nav = {
  main: [
    { href: '/verhaal', label: 'Verhaal' },
    { href: '/waar-te-koop', label: 'Waar te koop' },
    { href: '/community', label: 'Community' },
    { href: '/faq', label: 'FAQ' },
  ],
  cta: { href: '/contact', label: 'Contact' },
  help: [
    { href: '/faq', label: 'Veelgestelde vragen' },
    { href: '/contact', label: 'Contact' },
    { href: '/18-plus', label: 'Verantwoord drinken' },
  ],
  legal: [
    { href: '/juridisch/privacy', label: 'Privacy' },
    { href: '/juridisch/cookies', label: 'Cookies' },
    { href: '/juridisch/voorwaarden', label: 'Voorwaarden' },
    { href: '/juridisch/disclaimer', label: 'Disclaimer' },
    { href: '/juridisch/colofon', label: 'Colofon' },
  ],
};

/**
 * NIX18, geen alcohol onder de 18. Staat in de footer.
 * Zet het officiële logo (svg of png) in public/logos, vul `logo` in (bijvoorbeeld '/logos/nix18.svg') en zet `placeholder` op false.
 * Tot die tijd staat er een neutrale tekstbadge. Controleer de gebruiksvoorwaarden van het logo bij nix18.nl.
 */
export const nix18 = {
  href: 'https://www.nix18.nl/',
  label: 'NIX18',
  logo: null as string | null,
  placeholder: true,
};

/** Pagina's waar de leeftijdscontrole niet over heen ligt (juridisch en uitleg). */
export const ageGateExempt = ['/18-plus', '/leeftijd-nee', '/juridisch', '/stijlgids'];

/** Volgorde van de secties op de homepage. Haal een regel weg of verplaats hem. */
export const homeSections = ['hero', 'claims', 'clock', 'flavours', 'quote', 'story', 'reviews', 'where', 'community', 'newsletter'] as const;

/**
 * Actiebar onder de header, bijvoorbeeld voor een actie of feestdag. Zet `enabled` op false om hem weg te halen.
 * Wijzig `id` bij een nieuwe actie, dan komt de balk terug bij bezoekers die hem eerder sloten.
 * `from` en `until` zijn data (JJJJ-MM-DD) en worden in de browser gecontroleerd, dus de balk verdwijnt ook zonder nieuwe build.
 */
export const announcement = {
  enabled: true,
  id: 'actie-1',
  // Tijdelijke tekst tot er een echte actie of feestdag is. Vervang tekst, link en id zodra die er is.
  text: 'Mando komt eraan: amandel en cola, ijskoud.',
  linkLabel: 'Blijf op de hoogte' as string,
  href: '/#nieuwsbrief' as string,
  from: null as string | null,
  until: null as string | null,
  dismissible: true,
};

/** Socials. `url` is de profielpagina. Zolang `placeholder` true is, staat er een [X] bij. */
export const socials = [
  {
    id: 'instagram' as const,
    label: 'Instagram',
    handle: X('Instagram-account'),
    url: 'https://www.instagram.com/',
    placeholder: true,
  },
  {
    id: 'tiktok' as const,
    label: 'TikTok',
    handle: X('TikTok-account'),
    url: 'https://www.tiktok.com/',
    placeholder: true,
  },
];

export type SocialPost = {
  platform: 'instagram' | 'tiktok';
  /** Volledige URL van een openbare post of video. `null` toont een placeholder-tegel. */
  url: string | null;
  caption: string;
};

/**
 * Posts die op Home en Community worden ingesloten.
 * Plak een openbare Instagram-post (https://www.instagram.com/p/...) of TikTok-video
 * (https://www.tiktok.com/@account/video/123...) bij `url`. De embed laadt pas na toestemming.
 */
export const socialFeed: SocialPost[] = [
  { platform: 'instagram', url: null, caption: X('eerste Instagram-post') },
  { platform: 'tiktok', url: null, caption: X('eerste TikTok-video') },
  { platform: 'instagram', url: null, caption: X('tweede Instagram-post') },
];

export const hashtags = [X('merkhashtag')];

/** Formulieren: zet PUBLIC_FORM_ENDPOINT in je omgeving (bijvoorbeeld Formspree of eigen server). */
export const forms = {
  endpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) || '',
  /** Wordt gebruikt als er geen endpoint is. */
  mailtoFallback: true,
};

/** Cookies en opslag, voor de cookiepagina en de banner. */
export const storageKeys = {
  age: 'mando_age',
  theme: 'mando-theme',
  consent: 'mando-consent',
  bar: 'mando-bar',
};
