import { mockContacts, type Contact } from './contacts';

export type Group = {
  id: string;
  name: string;
  contacts: Contact[];
  timesCalled: number;
};

function contactsByIds(ids: string[]): Contact[] {
  return ids
    .map((id) => mockContacts.find((contact) => contact.id === id))
    .filter((contact): contact is Contact => contact !== undefined);
}

export const mockGroups: Group[] = [
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
