/**
 * Juridische teksten. Dit zijn conceptsjablonen met placeholders ([X: ...]), geen juridisch advies.
 * Laat ze nalopen door een bevoegde persoon voordat de site live gaat (AVG, cookiewet, Alcoholwet,
 * Reclamecode voor Alcoholhoudende Dranken, consumentenrecht bij een eventuele webshop).
 */
import { X, brand, company } from '../config/site';

export type Section = {
  h: string;
  p?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
};
export type LegalPage = { slug: string; title: string; description: string; intro: string; sections: Section[]; updated: string };

const updated = X('datum van laatste wijziging');
const who = `${company.legalName} (${company.legalForm}), gevestigd aan ${company.address}, ${company.postalCode}. KvK-nummer ${company.kvk}.`;

export const privacy: LegalPage = {
  slug: 'privacy',
  title: 'Privacyverklaring',
  description: 'Lees welke persoonsgegevens Mando verwerkt, waarom en welke rechten je hebt.',
  intro: 'In deze verklaring leggen we uit welke persoonsgegevens we verwerken als je onze site gebruikt, waarvoor we ze gebruiken en welke rechten je hebt.',
  updated,
  sections: [
    {
      h: 'Wie zijn wij',
      p: [`Mando is een merk van ${who}`, `Wij zijn verwerkingsverantwoordelijke voor de gegevens die in deze verklaring staan. Je bereikt ons via ${company.email} of ${company.phone}.`],
    },
    {
      h: 'Welke gegevens verwerken wij en waarvoor',
      table: {
        head: ['Waarvoor', 'Gegevens', 'Grondslag', 'Bewaartermijn'],
        rows: [
          ['Nieuwsbrief', 'E-mailadres, tijdstip van aanmelding en je toestemming', 'Toestemming', `Tot je je uitschrijft, daarna ${X('termijn')}`],
          ['Contactformulier', 'Naam, e-mailadres, onderwerp en bericht', 'Gerechtvaardigd belang: je vraag beantwoorden', X('termijn')],
          ['Leeftijdscontrole', 'Een cookie met je keuze, geen persoonsgegevens', 'Noodzakelijk voor het aanbieden van de site', '30 dagen'],
          ['Statistiek (alleen met toestemming)', `Anonieme gebruiksgegevens via ${X('analytics-tool')}`, 'Toestemming', X('termijn')],
          ['Social media inhoud (alleen met toestemming)', 'Gegevens die Instagram (Meta) en TikTok zelf verzamelen als je hun inhoud laadt', 'Toestemming', 'Volgens hun eigen beleid'],
        ],
      },
    },
    {
      h: 'Met wie delen wij gegevens',
      p: [`We delen gegevens alleen met partijen die ons helpen de site en de nieuwsbrief te laten werken, zoals ${X('hostingpartij')}, ${X('e-mailtool voor de nieuwsbrief')} en ${X('formulierdienst')}. Met hen sluiten we een verwerkersovereenkomst: ${X('status van de overeenkomsten')}.`, 'We verkopen je gegevens niet.'],
    },
    {
      h: 'Doorgifte buiten de Europese Economische Ruimte',
      p: [`Worden gegevens buiten de EER verwerkt? ${X('ja of nee, en onder welke waarborgen')}`],
    },
    {
      h: 'Hoe lang bewaren wij gegevens',
      p: ['We bewaren gegevens niet langer dan nodig voor het doel waarvoor we ze hebben verzameld. De termijnen staan in de tabel hierboven.'],
    },
    {
      h: 'Beveiliging',
      p: ['We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, zoals een versleutelde verbinding (https) en beperkte toegang.'],
    },
    {
      h: 'Jouw rechten',
      p: ['Je hebt het recht op inzage, correctie, verwijdering, beperking van de verwerking, bezwaar en overdraagbaarheid van je gegevens. Heb je toestemming gegeven? Dan kun je die altijd intrekken.', `Stuur een verzoek naar ${company.email}. Wij reageren binnen een maand.`],
    },
    {
      h: 'Klacht',
      p: ['Ben je het niet eens met hoe we met je gegevens omgaan? Neem dan contact met ons op. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).'],
    },
    {
      h: 'Wijzigingen',
      p: ['We kunnen deze verklaring aanpassen. De datum van de laatste wijziging staat bovenaan.'],
    },
  ],
};

export const cookies: LegalPage = {
  slug: 'cookies',
  title: 'Cookieverklaring',
  description: 'Welke cookies en opslag de Mando site gebruikt en hoe je je keuze wijzigt.',
  intro: 'We gebruiken alleen wat nodig is om de site te laten werken. Voor inhoud van Instagram en TikTok en voor statistiek vragen we eerst toestemming.',
  updated,
  sections: [
    {
      h: 'Wat we gebruiken',
      table: {
        head: ['Naam', 'Doel', 'Bewaartermijn', 'Soort'],
        rows: [
          [storageName('age'), 'Onthoudt dat je de leeftijdscontrole hebt gedaan', '30 dagen', 'Noodzakelijk (cookie)'],
          [storageName('theme'), 'Onthoudt je gekozen thema (automatisch, dag of nacht)', 'Tot je het wist', 'Noodzakelijk (lokale opslag)'],
          [storageName('consent'), 'Onthoudt je keuze over cookies en inhoud van derden', X('termijn, bijvoorbeeld 12 maanden'), 'Noodzakelijk (lokale opslag)'],
          ['Instagram en TikTok inhoud', 'Posts tonen. Deze partijen plaatsen eigen cookies zodra jij toestemming geeft.', 'Volgens hun eigen beleid', 'Inhoud van derden'],
          [X('analytics-tool'), 'Anoniem meten hoe de site wordt gebruikt. Nu nog niet in gebruik.', X('termijn'), 'Statistiek'],
        ],
      },
    },
    {
      h: 'Je keuze wijzigen',
      p: ['Je kunt je keuze op elk moment aanpassen met de knop Cookie-instellingen onderaan elke pagina. Je kunt cookies ook verwijderen via de instellingen van je browser.'],
    },
    {
      h: 'Inhoud van derden',
      p: ['Als je toestemming geeft, laden we posts van Instagram (Meta) en TikTok. Die partijen kunnen dan gegevens over jou verzamelen. Lees hun privacy- en cookiebeleid voor details.'],
    },
  ],
};

function storageName(k: 'age' | 'theme' | 'consent') {
  return { age: 'mando_age', theme: 'mando-theme', consent: 'mando-consent' }[k];
}

export const terms: LegalPage = {
  slug: 'voorwaarden',
  title: 'Gebruiksvoorwaarden',
  description: 'De voorwaarden voor het gebruik van de Mando website.',
  intro: 'Door deze site te gebruiken ga je akkoord met deze voorwaarden.',
  updated,
  sections: [
    { h: '1. Toepassing', p: [`Deze voorwaarden gelden voor het gebruik van de website van ${brand.name}, een merk van ${who}`] },
    { h: '2. Gebruik van de site', p: ['Je gebruikt de site alleen voor eigen, rechtmatig gebruik. Je zorgt dat je 18 jaar of ouder bent als je de site bezoekt om informatie over alcoholhoudende producten te bekijken.'] },
    { h: '3. Intellectueel eigendom', p: [`Alle teksten, beelden, het logo en het ontwerp zijn eigendom van ${company.legalName} of van hun rechthebbenden. Zonder schriftelijke toestemming mag je ze niet kopiëren, verspreiden of gebruiken.`] },
    { h: '4. Productinformatie', p: ['We besteden zorg aan de informatie op de site, maar kunnen niet garanderen dat alles volledig of actueel is. Productafbeeldingen zijn indicatief. Bij verschil gaat de informatie op het etiket voor.'] },
    { h: '5. Links naar andere sites', p: ['Op de site staan links naar sites van anderen. Wij zijn niet verantwoordelijk voor hun inhoud of privacybeleid.'] },
    { h: '6. Aansprakelijkheid', p: [`${company.legalName} is niet aansprakelijk voor schade door het gebruik van de site, tenzij sprake is van opzet of grove schuld. ${X('controleer deze zin met een jurist')}`] },
    { h: '7. Verkoop', p: [`Voor de verkoop van producten gelden aparte algemene voorwaarden. ${X('algemene voorwaarden voor verkoop, zodra een webshop live gaat')}`] },
    { h: '8. Toepasselijk recht', p: [`Op deze voorwaarden is Nederlands recht van toepassing. Geschillen leggen we voor aan de bevoegde rechter in ${X('arrondissement')}.`] },
  ],
};

export const disclaimer: LegalPage = {
  slug: 'disclaimer',
  title: 'Disclaimer',
  description: 'Disclaimer van de Mando website, inclusief informatie over alcohol en leeftijd.',
  intro: 'Wat je moet weten over de informatie op deze site.',
  updated,
  sections: [
    { h: 'Alcohol en leeftijd', p: [`Mando bevat alcohol (${brand.abv}) en is alleen bedoeld voor mensen van 18 jaar en ouder. Geniet met mate.`] },
    { h: 'Informatie', p: ['De informatie op deze site is bedoeld als algemene informatie over het merk en het product. Er kunnen geen rechten aan worden ontleend.'] },
    { h: 'Geen advies', p: ['De site bevat geen medisch, juridisch of ander professioneel advies.'] },
    { h: 'Beschikbaarheid', p: ['We streven naar een site die altijd werkt, maar kunnen onderbrekingen of fouten niet uitsluiten.'] },
  ],
};

export const colofon: LegalPage = {
  slug: 'colofon',
  title: 'Colofon',
  description: 'Bedrijfsgegevens, ontwerp en bouw van de Mando website.',
  intro: 'Gegevens over Mando en over wie deze site heeft gemaakt.',
  updated,
  sections: [
    {
      h: 'Bedrijfsgegevens',
      table: {
        head: ['Onderdeel', 'Gegevens'],
        rows: [
          ['Handelsnaam', brand.name],
          ['Bedrijfsnaam', company.legalName],
          ['Rechtsvorm', company.legalForm],
          ['Adres', `${company.address}, ${company.postalCode}`],
          ['KvK-nummer', company.kvk],
          ['Btw-nummer', company.vat],
          ['E-mail', company.email],
          ['Telefoon', company.phone],
          ['Vergunning Alcoholwet', company.alcoholLicense],
        ],
      },
    },
    {
      h: 'Ontwerp en bouw',
      p: [`Ontwerp en illustraties: ${X('naam ontwerper of bureau')}. Bouw: ${X('naam bouwer')}.`, 'Lettertype: Jost, onder de SIL Open Font License.'],
    },
  ],
};

export const legalPages: Record<string, LegalPage> = { privacy, cookies, voorwaarden: terms, disclaimer, colofon };
