import { z } from 'zod';

import { msg } from './messages';

/** At least one letter and one digit — length is enforced separately by `.min()`. */
const PASSWORD_COMPLEXITY = /^(?=.*[A-Za-z])(?=.*\d).+$/;

/**
 * Details for the `CreateAccount` screen.
 *
 * `firstName`/`lastName` reuse `contactFormSchema`'s rule verbatim (required,
 * `.trim()`, `firstNameRequired`/`lastNameRequired`) — they're a person's name
 * here too, not a new kind of field.
 *
 * The rest is credentials, and departs from `loginFormSchema` in two ways,
 * both because this form is choosing a credential rather than repeating one
 * back:
 *
 * **`password` carries a minimum length and a complexity rule.** Login can't
 * honestly enforce either — a correct legacy password must still work, and a
 * `min(8)` there would publish the policy to anyone who opens the screen.
 * Registration is exactly where that policy belongs, since it applies going
 * forward to a password the user is choosing right now.
 *
 * **`confirmPassword` exists purely to catch a typo.** It duplicates no
 * information the server needs — a mismatch is caught with `.refine()` and
 * reported on `confirmPassword`, never on `password`, so the field that
 * disagrees is the one that shows the error.
 *
 * Whether `username` is already taken can't be checked here — it needs the
 * account list in `authStore`, which a module-level schema has no access to.
 * `CreateAccount` reports that as a field error itself after `signUp` returns.
 */
export const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(1, msg('firstNameRequired')),
    lastName: z.string().trim().min(1, msg('lastNameRequired')),
    username: z.string().trim().min(1, msg('usernameRequired')),
    password: z
      .string()
      .min(8, msg('passwordWeak'))
      .regex(PASSWORD_COMPLEXITY, msg('passwordWeak')),
    confirmPassword: z.string().min(1, msg('confirmPasswordRequired')),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: msg('passwordMismatch'),
    path: ['confirmPassword'],
  });

/** Editable form shape for the create-account screen. */
export type TRegisterFormValues = z.infer<typeof registerFormSchema>;
