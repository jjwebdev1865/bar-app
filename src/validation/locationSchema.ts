import { z } from 'zod';

import { isValidZip } from '../utils/zipFormat';
import { msg } from './messages';

/**
 * Shared by the `CreateLocation` screen and `LocationDetailModal`. Coordinates
 * are not part of the form — the create flow assigns them and an edit carries
 * the existing pair through untouched.
 *
 * The address is split into the same parts a contact carries. `addressLine1`
 * stays required, which is what the old single `address` field enforced; the
 * rest are "blank or valid", matching `contactFormSchema` — every input is a
 * controlled `TextInput` that always holds a string, so `''` is the empty
 * state.
 */
export const locationFormSchema = z.object({
  name: z.string().trim().min(1, msg('locationNameRequired')),
  addressLine1: z.string().trim().min(1, msg('addressRequired')),
  addressLine2: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  zip: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidZip(value), {
      message: msg('zipInvalid'),
    }),
});

/** Editable form shape for a location, shared by the create and detail modals. */
export type TLocationFormValues = z.infer<typeof locationFormSchema>;
