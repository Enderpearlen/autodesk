/**
 * Reviews op de homepage. Dit zijn VOORBEELDEN en geen echte klantreacties.
 * Vervang ze na de lancering door echte reviews (met toestemming) en zet `placeholder` op false.
 * Zolang er een review met `placeholder: true` staat, faalt `npm run check:live`.
 */
export type Review = {
  stars: 1 | 2 | 3 | 4 | 5;
  name: string;
  text: string;
  placeholder: boolean;
};

export const reviews: Review[] = [
  { stars: 5, name: 'Sanne, Eindhoven', text: 'Eindelijk een amaretto cola die niet te zoet is. IJskoud uit het blik en je proeft echt de amandel.', placeholder: true },
  { stars: 5, name: 'Daan, Utrecht', text: 'Mee naar het strand genomen en binnen vijf minuten leeg. Het blik ziet er ook nog eens goed uit.', placeholder: true },
  { stars: 4, name: 'Lotte, Den Bosch', text: 'Lekker op een warme avond. Voor mij mag de bubbel iets steviger, verder helemaal prima.', placeholder: true },
];
