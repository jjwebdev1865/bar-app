export type BarLocation = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
};

export const mockLocations: BarLocation[] = [
  {
    id: 'loc-1',
    name: 'Iceberg Lounge',
    longitude: -74.006,
    latitude: 40.7128,
    address: '1 Iceberg Way, Gotham City',
  },
  {
    id: 'loc-2',
    name: 'Monarch Theatre Bar',
    longitude: -73.9857,
    latitude: 40.7484,
    address: '42 Crime Alley, Gotham City',
  },
  {
    id: 'loc-3',
    name: 'Gotham Arms',
    longitude: -73.9772,
    latitude: 40.7614,
    address: '100 Park Row, Gotham City',
  },
  {
    id: 'loc-4',
    name: 'The Clocktower',
    longitude: -74.0445,
    latitude: 40.6892,
    address: '88 Clocktower Lane, Gotham City',
  },
  {
    id: 'loc-5',
    name: 'Wayne Tower Lounge',
    longitude: -73.968,
    latitude: 40.785,
    address: '1 Wayne Tower, Gotham City',
  },
];

export function getLocationById(id: string): BarLocation | undefined {
  return mockLocations.find((location) => location.id === id);
}
