import { z } from 'zod';

import { msg } from './messages';

/**
 * Shared by `CreateGroupModal` and `GroupDetailModal`. The form holds member
 * *ids*; the modals resolve those against `contactsStore` on submit so the
 * `TGroup.contacts` copies are always built from current contact records.
 */
export const groupFormSchema = z.object({
  name: z.string().trim().min(1, msg('groupNameRequired')),
  contactIds: z.array(z.string()).min(1, msg('membersRequired')),
});

/** Editable form shape for a group, shared by the create and detail modals. */
export type TGroupFormValues = z.infer<typeof groupFormSchema>;
