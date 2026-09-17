import type { TTranslate, TTranslationKey } from '../types/common.types';

/**
 * Tags a translation key as a zod error message.
 *
 * Schemas are module-level constants, so they cannot call `t()` — and baking a
 * finished string in would freeze the copy at whichever language was active on
 * start-up. Instead the *key* rides along in
 * `formState.errors.<field>.message` and is translated where it is rendered.
 */
export const msg = (key: TTranslationKey): string => key;

/** Turns the key stored by `msg()` back into display copy at render time. */
export function translateFieldError(
  t: TTranslate,
  message: string | undefined,
): string | undefined {
  if (!message) {
    return undefined;
  }

  // Safe by construction: every message produced under `src/validation/` goes
  // through `msg()`, which only accepts a `TTranslationKey`.
  return t(message as TTranslationKey);
}
