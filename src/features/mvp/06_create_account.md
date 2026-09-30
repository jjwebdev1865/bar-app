# Create Account — Registration Form + Local Sign-Up

Written 2026-09-30. Scope: a `/create-account` route holding a React Hook Form
+ zod registration form, reachable via a "create one" link on `Login`, plus the
`authStore.signUp` action that backs it. Real account creation against a
backend is still step 04's problem: `signUp` only ever adds to an in-memory
list this session, the same way `signIn` only ever checked `MOCK_USERS`.

## Context

Builds directly on `03_login.md` (the `Login` screen, `authStore`,
`loginFormSchema`, the login-guard wiring in `AppLayout`) and
`05_multiple_local_users.md` (`MOCK_USERS` as a list of fixture accounts, and
the still-outstanding note that per-account data isolation is not implemented).
This step does not touch that outstanding item — every account, created or
fixture, still shares one persisted contacts/groups/locations dataset.

`CreateAccount` reuses `Login`'s page-chrome decisions rather than
`FormScreen`, for the same reasons `03_login.md` gives: nothing to cancel to,
and success is a store write the drawer guards react to, not a navigation the
screen performs itself.

## What changed

### `src/constants/routes.ts`

- `EAppRoute.CREATE_ACCOUNT = '/create-account'` and
  `EDrawerScreen.CREATE_ACCOUNT = 'create-account'` — both, for the same
  `TRoutesInSync` reason `LOGIN` needed both: `app/create-account.tsx` sits
  directly in `app/`, so it is a drawer-level file route even though it's
  hidden from the menu.

### `src/validation/registerSchema.ts`

- `registerFormSchema`: `username` (same rule as login), `password` (`.min(8)`
  + a regex requiring at least one letter and one digit — the complexity rule
  login deliberately omits, since it belongs on the form that is *choosing* a
  password, not the one repeating it back), `confirmPassword` (non-empty, then
  a `.refine()` checking it matches `password`, reported on `confirmPassword`).
- Added to the `src/validation/index.ts` barrel, alphabetically after
  `messages`.
- Username-taken is **not** a schema-level check — the schema has no access to
  `authStore`'s account list. `CreateAccount` reports that itself as a
  `setError('username', ...)` after `signUp` returns `false`.

### `src/stores/authStore.ts`

- Added `createdUsers: TCredentials[]`, starting `[]`, and `signUp(credentials)
  => boolean`.
- `signUp` checks the username against `[...MOCK_USERS, ...createdUsers]`; if
  free, it appends `{ username, password }` to `createdUsers` and signs the
  new account in (`set({ user: { username } })`) in the same call — matching
  the "auto sign-in and go to Home" behavior chosen for this step.
- `signIn` now checks the same combined list, so an account created this
  session can also sign back in after a sign-out (but not after a reload —
  see below).
- **`createdUsers` is not persisted**, deliberately matching `user`'s own
  non-persistence: a reload already drops the session, so it drops
  session-created accounts too rather than leaving a half-persisted store
  (accounts saved, session not). This was a explicit scope decision for this
  step, not an oversight — persisting real accounts is step 04's problem, not
  a fixture's.
- Unlike `signIn` (which never says *which* half of a credential pair failed,
  to avoid letting a login form enumerate accounts), `signUp` naming a taken
  username is fine: the person submitting the form is choosing that username,
  not guessing at someone else's.

### i18n — eight keys in `en.json` and `es.json`

`createAccount`, `createAccountPrompt`, `backToSignIn`, `confirmPassword`,
`confirmPasswordRequired`, `passwordMismatch`, `passwordWeak`,
`usernameTaken` — appended after the existing `signedOutIdle` entry, keeping
both locale files in the same key order.

### `src/pages/Login/CreateAccount.tsx` + `app/create-account.tsx`

- Same page chrome as `Login` (`SafeAreaView` default edges, no header —
  `AppLayout` hides it the same way): `KeyboardAvoidingView` →
  `ScrollView(keyboardShouldPersistTaps="handled")` → branding block → three
  `FormTextField`s → submit → a "back to sign in" link.
- `password` / `confirmPassword` use `autoComplete="new-password"` rather than
  login's `"password"` — the iOS/Android hint for a field that is *setting* a
  credential rather than replaying a saved one.
- On submit: calls `signUp({ username, password })` (never
  `confirmPassword` — that field only ever existed to be compared against
  `password` client-side). A `false` return sets a `username` field error
  (`usernameTaken`); a `true` return does nothing further, since `signUp`
  already flipped `authStore.user` and the guards below take it from there.
- The back link calls `router.replace(EAppRoute.LOGIN)` rather than
  `router.back()` — reachable only from `Login`'s link today so the two are
  equivalent, but `replace` doesn't depend on that staying true.

### `src/pages/Login/Login.tsx`

- Added a centered row below the submit button: `createAccountPrompt` text
  next to a `createAccountLink` `Pressable` (`accessibilityRole="link"`) that
  calls `router.push(EAppRoute.CREATE_ACCOUNT)`.

### `src/navigation/AppLayout.tsx`

- A second `<Drawer.Screen name={EDrawerScreen.CREATE_ACCOUNT}>` inside the
  same `guard={!isSignedIn}` block `LOGIN` already used, with the same three
  options (`hiddenDrawerItem`, `headerShown: false`, `swipeEnabled: false`) and
  for the same reasons — signed out, this and `Login` are the *only* two
  screens that exist, and neither may offer a way into the guarded app besides
  submitting its form.

## What this does **not** cover

- **Per-account data isolation** — still outstanding from
  `05_multiple_local_users.md`; unchanged by this step.
- **Persisted accounts.** `createdUsers` lives only in memory for the current
  session, matching `user`. A real "remember this account after a reload"
  requires step 04's backend, not a bigger in-memory list.
- **Password reset / edit.** Only creation is in scope; there is no screen to
  change a password once an account exists.
- **Rate limiting or lockout** on repeated `signUp`/`signIn` attempts — not
  meaningful against an in-memory fixture, and real auth (step 04) is where
  that belongs.

## Update (2026-09-30, same day): Show/Hide toggle on every masked field

Added to `src/components/common/FormTextField.tsx` rather than to `Login` or
`CreateAccount` individually — every `secureTextEntry` field in the app is one
of the four password fields across these two screens, so the toggle belongs on
the shared component, not duplicated three times.

- `secureTextEntry` now draws an inline "Show"/"Hide" `Pressable` inside the
  field (`styles.toggleButton`, absolutely positioned over `styles.input`,
  which gains `paddingRight` via `styles.inputWithToggle` so the toggle never
  overlaps typed text) when the prop is `true`.
- Reveal state (`isRevealed`) is local `useState`, not form state — it is
  swapped straight into the `TextInput`'s own `secureTextEntry` prop
  (`secureTextEntry && !isRevealed`) and never touches `field.value`.
- Two new i18n keys, `showPassword` / `hidePassword`, appended after
  `usernameTaken` in both `en.json` and `es.json`.
- The toggle's `accessibilityLabel` combines the action with the field's own
  label (e.g. "Show confirm password") — the visible "Show"/"Hide" text alone
  doesn't say which field it acts on when a screen has two masked fields.

## Update (2026-09-30, same day): submit disabled until the form is valid

`CreateAccount`'s submit button now renders `disabled` (and
`accessibilityState={{ disabled: true }}`, `styles.submitButtonDisabled`) until
`registerFormSchema` passes against the current values. This is a deliberate
departure from `Login`/`FormScreen`'s "always pressable, errors render inline"
convention: a rejected sign-in is one guess with nothing else to check first,
but registration has four independent rules (non-empty username, length,
complexity, confirm-password match) — disabling reads as "not yet" instead of
surfacing four inline errors at once the moment the button is pressed.

- Validity is computed with `useWatch({ control })` fed straight into
  `registerFormSchema.safeParse(...).success`, **not** `formState.isValid`.
  `isValid` only refreshes on the events `mode: 'onTouched'` triggers (blur,
  then change), so it would lag a field the user hasn't blurred yet — a
  freshly-focused `password` field could still read as valid from a stale
  computation. Re-parsing on every keystroke keeps the button in sync
  regardless of touched state.
- Inline field errors are untouched — they still only appear per-field via
  `mode: 'onTouched'`, so a blank fresh screen still doesn't render four red
  messages before anyone has typed anything; only the button reacts early.
- `username`-taken is still a runtime check against `authStore`, not part of
  `registerFormSchema` — the button can go enabled on a username the account
  list will still reject at submit time, same as before this change.

## Update (2026-09-30, same day): first name / last name

`CreateAccount` now collects `firstName` and `lastName`, rendered first — above
`username` — since they're the fields describing who the account belongs to
rather than the credential itself.

- `registerFormSchema` gained `firstName`/`lastName`, both required and
  `.trim()`ed, reusing `contactFormSchema`'s exact rule and message keys
  (`firstNameRequired`/`lastNameRequired`) rather than inventing new ones — a
  name is a name regardless of which form collects it. No new i18n keys were
  needed.
- The two fields use `autoComplete="given-name"` / `"family-name"` and
  `autoCapitalize="words"`, matching `CreateContact`'s convention for the same
  pair.
- **`TAuthUser`** (`common.types.ts`) gained optional `firstName?`/`lastName?`.
  Optional, not required, because a `MOCK_USERS` fixture sign-in still has no
  name to supply — only a `CreateAccount` signup can set them.
- **`authStore`**: `createdUsers` is now `TCreatedAccount[]`
  (`TCredentials & { firstName; lastName }`, defined locally in the store —
  it's an implementation detail of what gets held in memory, not a shape
  anything outside the store constructs). `signUp`'s parameter grew to match,
  and both the pushed `createdUsers` entry and the `user` it signs in now carry
  the name.
- **`signIn` also restores the name** when the matched account is a
  `TCreatedAccount` (checked with a `hasName` type guard), so a created account
  that signs out and back in keeps its name rather than losing it the way a
  `MOCK_USERS` sign-in always has to.
- The name is collected and stored, not merely validated and discarded — no
  screen renders it yet (a follow-on, not part of this change).

## Update (2026-09-30, same day): names on the `MOCK_USERS` fixtures too

The prior update left `TAuthUser.firstName`/`lastName` optional because a
`MOCK_USERS` sign-in had no name to supply. That gap is closed instead of kept:
all three `MOCK_USERS` entries (`jjiracek`, `jjiracekSlalom`, `jjiracekArcos` —
the same person's three consulting identities) now carry `firstName: 'James'`,
`lastName: 'Jiracek'`.

This let the shapes simplify rather than stay patched:

- The store-local `TCreatedAccount` type is gone. `TCredentials & { firstName;
  lastName }` is now `TNamedCredentials`, exported from `common.types.ts`
  instead of defined inside `authStore.ts` — it's no longer only a
  `createdUsers` implementation detail once `MOCK_USERS` is typed with it too,
  so it belongs with the other shared types.
- `MOCK_USERS` (`src/data/user.ts`) is now `TNamedCredentials[]`, not
  `TCredentials[]`.
- **`TAuthUser.firstName`/`lastName` are required**, not optional — every
  account behind `signIn`/`signUp` is now a `TNamedCredentials`, so there is no
  longer a code path that signs in a session with no name to attach.
- `signIn`'s `hasName` type guard is gone — with `MOCK_USERS` and
  `createdUsers` the same shape, the matched account always has a name, so
  `signIn` sets `firstName`/`lastName` unconditionally instead of branching.

## Follow-on work

- When step 04 lands a real backend, `signUp` (and `signIn`, and
  `MOCK_USERS`) all get deleted rather than hardened, same as
  `03_login.md` and `05_multiple_local_users.md` already noted for the login
  side.
