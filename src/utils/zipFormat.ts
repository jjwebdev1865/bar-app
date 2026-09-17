/** A plain US ZIP is 5 digits; ZIP+4 adds the 4-digit route segment. */
export const ZIP_DIGIT_COUNT = 5;
export const ZIP_PLUS_FOUR_DIGIT_COUNT = 9;

/** Character length of a fully masked ZIP+4 — `XXXXX-XXXX` is 10. */
export const ZIP_DISPLAY_LENGTH = 10;

/** Digits only — the canonical value behind any display formatting. */
export function zipDigits(value: string) {
  return value.replace(/\D/g, '');
}

/**
 * Progressive `XXXXX-XXXX` mask for a ZIP `TextInput`.
 *
 * As with the phone mask, the hyphen only appears once a digit sits behind it,
 * so backspacing past it doesn't immediately re-add it and trap the caret.
 */
export function formatZipInput(value: string) {
  const digits = zipDigits(value).slice(0, ZIP_PLUS_FOUR_DIGIT_COUNT);

  if (digits.length <= ZIP_DIGIT_COUNT) {
    return digits;
  }

  return `${digits.slice(0, ZIP_DIGIT_COUNT)}-${digits.slice(ZIP_DIGIT_COUNT)}`;
}

/** True for a 5-digit ZIP or a full ZIP+4; anything part-way is not yet valid. */
export function isValidZip(value: string) {
  const length = zipDigits(value).length;

  return length === ZIP_DIGIT_COUNT || length === ZIP_PLUS_FOUR_DIGIT_COUNT;
}
