import { z } from 'zod';

import { msg } from './messages';

/**
 * Credentials for the `Login` screen.
 *
 * Two deliberate departures from the other schemas in this folder:
 *
 * **`password` is not trimmed.** Every other string field here carries
 * `.trim()`, because a stray space in a contact's last name is a typo. In a
 * password it is a character — trimming would send credentials the user never
 * typed, and the failure reads as an unexplainable "wrong password" for anyone
 * whose password legitimately ends in a space. `username` keeps `.trim()`;
 * usernames are identifiers.
 *
 * **No minimum length or complexity rule.** Those belong on a registration
 * form. On login they reject a correct legacy password before it ever reaches
 * the server, and publish the password policy to anyone who opens the screen.
 * Non-empty is the whole of what a login form can honestly check client-side.
 */
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, msg('usernameRequired')),
  password: z.string().min(1, msg('passwordRequired')),
});

/** Editable form shape for the login screen. */
export type TLoginFormValues = z.infer<typeof loginFormSchema>;
