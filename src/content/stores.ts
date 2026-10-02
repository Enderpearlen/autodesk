import { X } from '../config/site';

export type StoreType = 'online' | 'supermarkt' | 'slijterij' | 'horeca';

export type Store = {
  name: string;
  type: StoreType;
  city: string;
  /** Website van het verkooppunt. */
  url?: string;
  /** Adres voor de routeknop. Zonder adres zoekt de knop op naam en plaats. */
  address?: string;
  placeholder?: boolean;
};

/**
 * Voorbeelddata. Vervang door echte verkooppunten (of laad ze uit een CSV of API).
 * Alles met `placeholder: true` is nog niet echt en wordt door check:live gevonden.
 */
export const stores: Store[] = [
  { name: X('naam webshop'), type: 'online', city: 'Online', url: 'https://www.mando-drinks.example/', placeholder: true },
  { name: X('naam supermarkt'), type: 'supermarkt', city: 'Amsterdam', placeholder: true },
  { name: X('naam supermarkt'), type: 'supermarkt', city: 'Utrecht', placeholder: true },
  { name: X('naam slijterij'), type: 'slijterij', city: 'Rotterdam', placeholder: true },
  { name: X('naam slijterij'), type: 'slijterij', city: 'Eindhoven', placeholder: true },
  { name: X('naam bar of restaurant'), type: 'horeca', city: 'Amsterdam', placeholder: true },
  { name: X('naam bar of restaurant'), type: 'horeca', city: 'Den Bosch', placeholder: true },
];
