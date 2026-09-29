/**
 * Barrel for the app's type modules. Import types from here
 * (`import type { TContact } from '../../types'`) rather than reaching past it
 * to a specific `*.types.ts` file.
 *
 * Type-only by design — runtime values (enums, literals, helpers) live in
 * `src/constants/`.
 */
export type * from './common.types';
export type * from './home.types';
export type * from './myContacts.types';
export type * from './navigation.types';
