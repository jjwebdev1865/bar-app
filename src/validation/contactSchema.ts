import { z } from 'zod';

import type { TContact, TTranslationKey } from '../types/common.types';
import { PHONE_DIGIT_COUNT, phoneDigits } from '../utils/phoneFormat';
import { isValidZip } from '../utils/zipFormat';
import { msg } from './messages';

const EMAIL = z.email();

// The input is masked to `(XXX) XXX-XXXX`, so separators are a given and only
// the digit count can fall short.
function isValidPhone(value: string) {
  return phoneDigits(value).length === PHONE_DIGIT_COUNT;
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
  addressLine1: z.string().trim(),
  addressLine2: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  zip: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidZip(value), {
      message: msg('zipInvalid'),
    }),
  favoriteBarId: z.string(),
});

/** Editable form shape for a contact, shared by the create and detail modals. */
export type TContactFormValues = z.infer<typeof contactFormSchema>;

/** Case- and whitespace-insensitive identity for a contact's full name. */
export function contactNameKey(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.toLowerCase();
}

/** Case- and whitespace-insensitive identity for a contact's email. */
export function contactEmailKey(email: string) {
  return email.trim().toLowerCase();
}

// Phone identity for the duplicate check is `phoneDigits` from
// `utils/phoneFormat` — the same normalisation the input mask uses, so a stored
// "(555) 100-0001" and a freshly typed "(555)100-0001" match.

const NAME_TAKEN_KEY: TTranslationKey = 'contactNameTaken';

/**
 * True when a field error came from the cross-field duplicate-name rule.
 *
 * Callers need this because the rule reports on two fields at once, which means
 * they have to be revalidated as a pair — see `CreateContactModal`.
 */
export function isNameConflictError(error: { message?: string } | undefined) {
  return error?.message === NAME_TAKEN_KEY;
}

/**
 * `contactFormSchema` plus uniqueness checks — full name, email and phone —
 * against the contacts already in the store.
 *
 * These rules depend on data a module-level schema cannot reach, so the caller
 * builds the schema instead, memoised on the contact list since `useForm`
 * re-reads its resolver on every render.
 *
 * Because `superRefine` only runs once the field-level parse has passed, a
 * half-typed name or a malformed email never also collects a duplicate message.
 */
export function createContactFormSchema(existingContacts: TContact[]) {
  const takenNames = new Set(
    existingContacts.map((contact) =>
      contactNameKey(contact.firstName, contact.lastName),
    ),
  );
  // Email and phone are optional, so blanks are legal and repeatable — they
  // must never land in the taken sets or the second contact left without an
  // email would collide with the first.
  const takenEmails = new Set(
    existingContacts
      .map((contact) => contactEmailKey(contact.email))
      .filter(Boolean),
  );
  const takenPhones = new Set(
    existingContacts
      .map((contact) => phoneDigits(contact.phone))
      .filter(Boolean),
  );

  return contactFormSchema.superRefine((values, ctx) => {
    if (takenNames.has(contactNameKey(values.firstName, values.lastName))) {
      // Reported on both halves of the name: it is the pair that collides, so
      // both inputs are flagged. Anchoring to fields rather than the form root
      // is also what lets the wizard's per-step `trigger()` block step one.
      for (const path of ['firstName', 'lastName'] as const) {
        ctx.addIssue({
          code: 'custom',
          message: msg(NAME_TAKEN_KEY),
          path: [path],
        });
      }
    }

    if (values.email && takenEmails.has(contactEmailKey(values.email))) {
      ctx.addIssue({
        code: 'custom',
        message: msg('emailTaken'),
        path: ['email'],
      });
    }

    if (values.phone && takenPhones.has(phoneDigits(values.phone))) {
      ctx.addIssue({
        code: 'custom',
        message: msg('phoneTaken'),
        path: ['phone'],
      });
    }
  });
}
