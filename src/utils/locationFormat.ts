import type {
  TBarLocation,
  TContact,
  TTranslate,
} from '../types';

// Mock locations cluster around Gotham City — keep random assignments in the same area.
const GOTHAM_LATITUDE_RANGE: [number, number] = [40.68, 40.79];
const GOTHAM_LONGITUDE_RANGE: [number, number] = [-74.05, -73.96];

function randomInRange([min, max]: [number, number]) {
  return Math.random() * (max - min) + min;
}

/** A new location's create flow assigns coordinates rather than collecting them in a form. */
export function getRandomLocationCoordinates() {
  return {
    latitude: randomInRange(GOTHAM_LATITUDE_RANGE),
    longitude: randomInRange(GOTHAM_LONGITUDE_RANGE),
  };
}

/** How many contacts have this location set as their favorite bar. */
export function countFavoriteContacts(
  location: TBarLocation,
  contacts: TContact[],
) {
  return contacts.filter((contact) => contact.favoriteBarId === location.id)
    .length;
}

/** Renders `Favorite of N contacts`, singularizing the noun at N === 1. */
export function formatFavoriteOfLabel(fans: number, t: TTranslate) {
  return t('favoriteOf', {
    count: fans,
    contacts: fans === 1 ? t('contact') : t('contacts'),
  });
}
