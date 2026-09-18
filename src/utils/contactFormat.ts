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
