/** Contacts hold 10-digit numbers, displayed as `(XXX) XXX-XXXX`. */
export const PHONE_DIGIT_COUNT = 10;

/** Digits only — the canonical value behind any display formatting. */
export function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

/**
 * Lays the separators out around however many digits are present.
 *
 * A separator is only added once a digit sits behind it, which is what keeps
 * backspace working in the masked input. Closing the paren the moment the third
 * digit lands would mean deleting it just re-adds it — the caret gets stuck and
 * the field can never be cleared.
 */
function applyPhoneMask(digits: string) {
  if (digits.length === 0) {
    return '';
  }

  const areaCode = digits.slice(0, 3);

  if (digits.length <= 3) {
    return `(${areaCode}`;
  }

  const exchange = digits.slice(3, 6);

  if (digits.length <= 6) {
    return `(${areaCode}) ${exchange}`;
  }

  return `(${areaCode}) ${exchange}-${digits.slice(6)}`;
}

/** Progressive `(XXX) XXX-XXXX` mask for a phone `TextInput`. */
export function formatPhoneInput(value: string) {
  const entered = phoneDigits(value);
  // A pasted "+1 555 123 4567" carries a country code. North American area
  // codes never start with 1, so a leading 1 on 11 digits is unambiguous — and
  // without dropping it the whole number shifts a place and silently becomes a
  // different, still-valid-looking number.
  const national =
    entered.length === PHONE_DIGIT_COUNT + 1 && entered.startsWith('1')
      ? entered.slice(1)
      : entered;

  return applyPhoneMask(national.slice(0, PHONE_DIGIT_COUNT));
}

/**
 * Display form for a stored phone number, so a contact reads the same wherever
 * it is shown regardless of how its number was originally entered.
 *
 * Anything that is not a 10-digit number is passed through untouched: data
 * predating the mask — or arriving from a future backend — is better shown
 * as-is than reshaped into something that looks canonical but isn't.
 */
export function formatPhoneDisplay(phone: string) {
  const digits = phoneDigits(phone);

  if (digits.length !== PHONE_DIGIT_COUNT) {
    return phone;
  }

  return applyPhoneMask(digits);
}
