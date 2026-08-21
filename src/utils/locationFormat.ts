import type {
  TBarLocation,
  TContact,
  TTranslate,
} from '../types/common.types';

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
