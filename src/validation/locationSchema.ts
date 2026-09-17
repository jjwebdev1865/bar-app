import { z } from 'zod';

import { msg } from './messages';

/**
 * Shared by `CreateLocationModal` and `LocationDetailModal`. Coordinates are
 * not part of the form — the create flow assigns them and an edit carries the
 * existing pair through untouched.
 */
export const locationFormSchema = z.object({
  name: z.string().trim().min(1, msg('locationNameRequired')),
  address: z.string().trim().min(1, msg('addressRequired')),
});

/** Editable form shape for a location, shared by the create and detail modals. */
export type TLocationFormValues = z.infer<typeof locationFormSchema>;
