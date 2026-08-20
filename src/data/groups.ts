import type { TContact, TGroup } from '../types/common.types';
import { MOCK_CONTACTS } from './contacts';

function contactsByIds(ids: string[]): TContact[] {
  return ids
    .map((id) => MOCK_CONTACTS.find((contact) => contact.id === id))
    .filter((contact): contact is TContact => contact !== undefined);
}

export const MOCK_GROUPS: TGroup[] = [
  {
    id: 'group-1',
    name: 'Bat-Family',
    contacts: contactsByIds(['1', '4', '5', '7', '8']),
    timesCalled: 0,
  },
  {
    id: 'group-2',
    name: 'Gotham Night Out',
    contacts: contactsByIds(['2', '9', '11', '12']),
    timesCalled: 0,
  },
  {
    id: 'group-3',
    name: 'Wayne Enterprises',
    contacts: contactsByIds(['1', '3', '6', '10']),
    timesCalled: 0,
  },
];
