import type { TNamedCredentials } from '../types';

/**
 * The accounts that can sign in — the only seed data left in `src/data`, since
 * the contact / group / location mocks were removed and their stores start
 * empty.
 *
 * **This is a fixture, not authentication.** Every password is in the bundle in
 * plain text and compared with `===`, which is only acceptable because there is
 * nothing real behind it. It must be deleted — not hardened — when step 04
 * (`src/features/mvp/04_event_creation_api.md`) introduces a server that can
 * actually verify a credential. `Login`'s on-screen hint reads from here too,
 * so the two disappear together.
 *
 * Multiple entries exist so more than one signed-in identity can be exercised
 * on the same device — the same person across three consulting identities,
 * which is why every entry shares one name. The domain stores
 * (contacts/groups/locations) are not yet namespaced per account — see
 * `authStore`'s doc comment — so every one of these still shares the same
 * persisted data until that follow-up lands.
 */
export const MOCK_USERS: TNamedCredentials[] = [
  {
    username: 'jjiracek',
    password: 'Password1!',
    firstName: 'Jim',
    lastName: 'Jiracek',
    email: 'jim.jiracek2@gmail.com',
    phone: '5152501444',
  },
  {
    username: 'jjiracekSlalom',
    password: 'Password1!',
    firstName: 'James',
    lastName: 'Jiracek',
    email: 'james.jiracek@slalom.com',
  },
  {
    username: 'jjiracekArcos',
    password: 'Password1!',
    firstName: 'Jimbo',
    lastName: 'Jiracek',
    email: 'jjiracek@arcos-inc.com',
  },
];
