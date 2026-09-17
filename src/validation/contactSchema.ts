import { z } from 'zod';

import { msg } from './messages';

const EMAIL = z.email();

// Digits plus the usual separators. The length check runs on digits alone, so
// "+1 (555) 010-1234" and "5550101234" are both accepted.
const PHONE_CHARACTERS = /^[+(\d][\d\s().-]*$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

function isValidPhone(value: string) {
  if (!PHONE_CHARACTERS.test(value)) {
    return false;
  }

  const digitCount = value.replace(/\D/g, '').length;

  return digitCount >= MIN_PHONE_DIGITS && digitCount <= MAX_PHONE_DIGITS;
}

/**
 * Shared by `CreateContactModal` and `ContactDetailModal`.
 *
 * Only the name fields are required — that matches what the modals already
 * enforced. The other fields are modelled as "blank or valid" rather than
 * `.optional()` because every input is a controlled `TextInput` that always
 * holds a string, so `''` is the empty state.
 *
 * `.trim()` means the values handed to `handleSubmit` arrive already trimmed;
 * the inputs still show exactly what the user typed.
 */
export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, msg('firstNameRequired')),
  lastName: z.string().trim().min(1, msg('lastNameRequired')),
  nickname: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || EMAIL.safeParse(value).success, {
      message: msg('emailInvalid'),
    }),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidPhone(value), {
      message: msg('phoneInvalid'),
    }),
  address: z.string().trim(),
  favoriteBarId: z.string(),
});

/** Editable form shape for a contact, shared by the create and detail modals. */
export type TContactFormValues = z.infer<typeof contactFormSchema>;
