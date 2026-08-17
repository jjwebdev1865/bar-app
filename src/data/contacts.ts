export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  phone: string;
  address: string;
  favoriteBarId: string;
};

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Bruce',
    lastName: 'Wayne',
    nickname: 'Bats',
    email: 'bruce.wayne@wayneenterprises.com',
    phone: '(555) 100-0001',
    address: '1007 Mountain Drive, Gotham City',
    favoriteBarId: 'loc-5',
  },
  {
    id: '2',
    firstName: 'Selina',
    lastName: 'Kyle',
    nickname: 'Cat',
    email: 'selina.kyle@gotham.net',
    phone: '(555) 100-0002',
    address: '42 East End Avenue, Gotham City',
    favoriteBarId: 'loc-1',
  },
  {
    id: '3',
    firstName: 'Harvey',
    lastName: 'Dent',
    email: 'harvey.dent@gotham.gov',
    phone: '(555) 100-0003',
    address: '1 City Hall Plaza, Gotham City',
    favoriteBarId: 'loc-3',
  },
  {
    id: '4',
    firstName: 'Barbara',
    lastName: 'Gordon',
    nickname: 'Babs',
    email: 'barbara.gordon@gcpd.gov',
    phone: '(555) 100-0004',
    address: '88 Clocktower Lane, Gotham City',
    favoriteBarId: 'loc-4',
  },
  {
    id: '5',
    firstName: 'Dick',
    lastName: 'Grayson',
    nickname: 'Wing',
    email: 'dick.grayson@bludhaven.com',
    phone: '(555) 100-0005',
    address: '12 Circus Way, Blüdhaven',
    favoriteBarId: 'loc-2',
  },
  {
    id: '6',
    firstName: 'Lucius',
    lastName: 'Fox',
    email: 'lucius.fox@wayneenterprises.com',
    phone: '(555) 100-0006',
    address: '1 Wayne Tower, Gotham City',
    favoriteBarId: 'loc-5',
  },
  {
    id: '7',
    firstName: 'Alfred',
    lastName: 'Pennyworth',
    nickname: 'Alfie',
    email: 'alfred.pennyworth@wayneestate.com',
    phone: '(555) 100-0007',
    address: 'Wayne Manor, Gotham City',
    favoriteBarId: 'loc-3',
  },
  {
    id: '8',
    firstName: 'Jim',
    lastName: 'Gordon',
    email: 'jim.gordon@gcpd.gov',
    phone: '(555) 100-0008',
    address: '1 Police Plaza, Gotham City',
    favoriteBarId: 'loc-4',
  },
  {
    id: '9',
    firstName: 'Vicki',
    lastName: 'Vale',
    email: 'vicki.vale@gothamgazette.com',
    phone: '(555) 100-0009',
    address: '200 Park Row, Gotham City',
    favoriteBarId: 'loc-2',
  },
  {
    id: '10',
    firstName: 'Edward',
    lastName: 'Nygma',
    nickname: 'Eddie',
    email: 'edward.nygma@riddleme.com',
    phone: '(555) 100-0010',
    address: '7 Question Mark Court, Gotham City',
    favoriteBarId: 'loc-3',
  },
  {
    id: '11',
    firstName: 'Oswald',
    lastName: 'Cobblepot',
    nickname: 'Oz',
    email: 'oswald.cobblepot@iceberg.com',
    phone: '(555) 100-0011',
    address: '1 Iceberg Lounge, Gotham City',
    favoriteBarId: 'loc-1',
  },
  {
    id: '12',
    firstName: 'Harley',
    lastName: 'Quinn',
    email: 'harley.quinn@arkham.net',
    phone: '(555) 100-0012',
    address: '13 Amusement Mile, Gotham City',
    favoriteBarId: 'loc-2',
  },
];
