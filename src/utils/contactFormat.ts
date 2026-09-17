import type { TContact } from '../types/common.types';

/** Renders `First "Nickname" Last`, or `First Last` when there's no nickname. */
export function formatContactDisplayName(
  contact: Pick<TContact, 'firstName' | 'lastName' | 'nickname'>,
) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

type TContactAddress = Pick<
  TContact,
  'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zip'
>;

/**
 * Renders the address parts as mailing-label lines, e.g.
 * `1007 Mountain Drive` / `Apt 2` / `Gotham City, NJ 07001`.
 *
 * Every part is optional, so blanks are dropped rather than left as empty lines
 * or dangling separators. Returns `''` when nothing was entered — callers decide
 * what to show in that case.
 */
export function formatContactAddress(contact: TContactAddress) {
  const cityState = [contact.city, contact.state].filter(Boolean).join(', ');
  const cityStateZip = [cityState, contact.zip].filter(Boolean).join(' ');

  return [contact.addressLine1, contact.addressLine2, cityStateZip]
    .filter(Boolean)
    .join('\n');
}
