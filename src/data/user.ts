import type { TCredentials } from '../types';

/**
 * The one account that can sign in — now the only seed data left in `src/data`,
 * since the contact / group / location mocks were removed and their stores
 * start empty.
 *
 * **This is a fixture, not authentication.** The password is in the bundle in
 * plain text and compared with `===`, which is only acceptable because there is
 * nothing real behind it. It must be deleted — not hardened — when step 04
 * (`src/features/mvp/04_event_creation_api.md`) introduces a server that can
 * actually verify a credential. `Login`'s on-screen hint reads from here too,
 * so the two disappear together.
 */
export const MOCK_USER: TCredentials = {
  username: 'jjiracek',
  password: 'Password1!',
};
