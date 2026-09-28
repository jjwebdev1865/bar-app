# Login — Username and Password Form

Written 2026-09-28. Scope: a `/login` route holding a React Hook Form + zod
username/password form, plus — added the same day, see "Follow-on" below — the
`authStore` that gates the rest of the app behind it. Authenticating against a
real backend is still step 04's problem: `signIn` compares against a single
hardcoded fixture account.

## Context

Steps 01 and 02 established how a form lives on a route in this app: `useForm` +
`zodResolver` bound through `useController`, fields rendered by `FormTextField`,
page chrome owned by `FormScreen`. Login is the first form that **isn't** a
create/edit surface, and two of those pieces don't carry over.

**`FormScreen` is the wrong scaffold.** It is built around leaving:

- it renders a pinned **Cancel / submit** row, and login has nothing to cancel
  *to* — it is the first screen, not a pushed one
- `leaveForm()` runs after every successful submit, `router.back()`-first with a
  `fallbackRoute` replace. Login needs the opposite — an unconditional
  `router.replace(EAppRoute.HOME)`, because the user must not be able to swipe
  back into the login screen once they're in
- its `fallbackRoute` prop is typed `EAppRoute` and exists solely for that
  Cancel path

Bending it to fit would mean an optional-cancel mode plus an opt-out of
`leaveForm` — two conditionals inside a component whose whole value is that no
screen can get the leave behavior wrong. Login renders its own
`SafeAreaView` / `KeyboardAvoidingView` instead. That is ~40 lines, and the
duplication is honest: it is a *different* page shape, not the same one with
flags.

`FormTextField` **does** carry over, and is the reason this step is small —
it already handles the `useController` binding, the uppercase label, the
inline error via `translateFieldError`, and the composite `accessibilityLabel`.
It is missing exactly one thing: a way to mask the password.

```
/login  (no header, no drawer)
   The Bar Signal
   ┌──────────────────┐
   │ USERNAME         │
   │ PASSWORD  ••••   │
   └──────────────────┘
   [     Sign in     ]
   Accounts aren't connected yet…
```

## Order of work

### 1. `FormTextField` — masking and autofill

Two optional props, sitting alongside the existing `keyboardType` /
`autoCapitalize` passthroughs:

- [x] `secureTextEntry?: boolean` — forwarded straight to `TextInput`
- [x] `autoComplete?: TextInputProps['autoComplete']` — forwarded the same way

`autoComplete` is not cosmetic. Without `"username"` / `"password"` hints, iOS
Keychain and Android Autofill don't recognise the pair, and the user types
credentials by hand on a phone keyboard. RN unified this prop across both
platforms, so one value covers them.

**No `format` interaction.** The masking prop must never be combined with a
`format` callback — a formatter rewrites what the user typed, and on a field
whose text is invisible that is unrecoverable. Nothing forces this in types;
it's a note on the prop's JSDoc.

### 2. `src/validation/loginSchema.ts`

- [x] `username: z.string().trim().min(1, msg('usernameRequired'))`
- [x] `password: z.string().min(1, msg('passwordRequired'))`
- [x] `export type TLoginFormValues = z.infer<typeof loginFormSchema>`
- [x] Add to the `src/validation/index.ts` barrel, alphabetically before
      `messages`

Exported as `loginFormSchema`, not `loginSchema` — the file is named for its
domain, the schema for its shape, matching `contactFormSchema` /
`groupFormSchema` / `locationFormSchema`.

Two departures from the other schemas, both deliberate:

**`password` is not trimmed.** Every other string field in this app carries
`.trim()`, because a stray space in a contact's last name is a typo. In a
password it is a *character* — trimming it means the app silently sends
credentials the user did not type, and the failure mode is an unexplainable
"wrong password" for someone whose password legitimately ends in a space.
`username` keeps `.trim()`; usernames are identifiers.

**No minimum length, no complexity rule.** Those belong on a *registration*
form. On login, a `min(8)` rule rejects a correct legacy password before it
reaches the server, and publishes the password policy to anyone who opens the
screen. Required-and-non-empty is the whole of what a login form can honestly
check client-side.

### 3. i18n — six keys in `en.json` and `es.json`

- [x] `signIn` — the heading and the submit button share it
- [x] `username`, `password` — field labels
- [x] `usernameRequired`, `passwordRequired` — validation messages, appended to
      the block that already ends at `phoneTaken`
- [x] `signInHint` — a footnote that accounts aren't wired up yet, matching the
      existing `themeHint` / `languageHint` convention for "this part is real
      but doesn't persist"

The labels go in beside the other field labels (`firstName`…`favoriteBar`); the
messages go in the validation block at the end. Both files keep identical key
order — they are identical today and a diff of the two should stay readable.

### 4. `src/types/navigation.types.ts`

- [x] `EAppRoute` gains `LOGIN = '/login'`
- [x] `EDrawerScreen` gains `LOGIN = 'login'`

Both, not one. `app/login.tsx` sits directly in `app/`, whose `_layout.tsx` *is*
the drawer, so login is a drawer-level file route whether or not it appears in
the menu — and `TRoutesInSync` fails the build if only one enum is updated. That
guard is doing exactly its job here.

It does **not** go in `ENestedRoute`: that enum is for routes pushed onto a
section stack, and login belongs to no section.

### 5. `AppLayout` — a drawer screen nobody can reach from the drawer

A fifth `<Drawer.Screen name={EDrawerScreen.LOGIN}>` with three options:

- [x] `drawerItemStyle: styles.hiddenDrawerItem` — `{ display: 'none' }` defined
      in the existing `createStyles`, not inline, per
      `.claude/rules/no-inline-styles.md`
- [x] `headerShown: false` — the drawer's default `headerLeft` is a
      `DrawerToggleButton`, and a hamburger menu into the authenticated app is
      the one control a login screen must not have
- [x] `swipeEnabled: false` — hiding the item and the button still leaves the
      edge-swipe gesture, which opens the same drawer

Registering the screen explicitly is what makes the first two possible; expo
Router would otherwise pick it up with the navigator's defaults and render it
with a menu button.

Because the header is hidden, the screen is the one place that must **not** use
`HEADER_SCREEN_EDGES`. That constant drops the top inset precisely because a
header consumed it; with no header, login needs all four edges, so it uses
`SafeAreaView`'s default. Worth a comment — every other screen in the repo does
the opposite, so this reads as a mistake otherwise.

### 6. `src/pages/Login/Login.tsx` + `app/login.tsx`

- [x] `useForm<TLoginFormValues>({ resolver: zodResolver(loginFormSchema),
      mode: 'onTouched', defaultValues: { username: '', password: '' } })` —
      same config as the create screens
- [x] `SafeAreaView` (all edges) → `KeyboardAvoidingView` (`padding` on iOS, no
      `keyboardVerticalOffset` since there is no header) → `ScrollView` with
      `keyboardShouldPersistTaps="handled"`, so tapping Sign in while the
      keyboard is up submits on the first tap instead of dismissing
- [x] Branding block reusing `appName`, then the two fields, then the submit
      button, then `signInHint`
- [x] `username`: `autoCapitalize="none"`, `autoComplete="username"`
- [x] `password`: `autoCapitalize="none"`, `autoComplete="password"`,
      `secureTextEntry`
- [x] `handleLogin` → placeholder log, with a `TODO` naming step 04 as where
      real auth lands. It originally ended in `router.replace(EAppRoute.HOME)`;
      the gating follow-on below replaced that with a store write
- [x] Submit button stays pressable rather than disabled, the same reasoning
      `FormScreen` carries: `handleSubmit` renders each failure inline, and a
      disabled button hides *why* nothing happened
- [x] `app/login.tsx` re-exports it, matching `app/contacts/new.tsx`

**The placeholder logs the password's *length*, never its value.** A throwaway
`console.log(values)` in a stub is how a password ends up in a device log. The
length is also the more useful thing to assert, since it is what proves the
schema left the user's whitespace alone.

The content container uses `flexGrow: 1` with `justifyContent: 'center'` rather
than `flex: 1` — the form centres on a tall screen but still scrolls once the
keyboard has taken half of it.

**No scroll-to-first-error.** `useFieldLayout` no-ops outside a `FormScreen`, so
the fields work unchanged — and with two fields both on screen at once there is
nothing to scroll to.

## Follow-on: auth state and route gating

Landed straight after the screen, not part of it. The original step shipped a
login form that guarded nothing — the app still opened on Home and `/login` was
reachable only by deep link. This closes that.

### `src/stores/authStore.ts`

- [x] `user: TAuthUser | null`, `signIn(credentials) => boolean`, `signOut()`
- [x] `TAuthUser` (`{ username: string }`) in `common.types.ts` — deliberately
      **not** `TContact`: a contact is somebody in your address book, not the
      account holding the session
- [x] Starts `null`, so the app opens on login
- [x] **No `isSignedIn` field.** Derived at the call site with
      `useAuthStore((state) => state.user !== null)`. A stored boolean is a
      second source of truth that can disagree with `user`, and the selector
      returns a primitive, so it compares cleanly under zustand v5
- [x] **No cross-store fan-out.** Unlike locations → contacts → groups, nothing
      else keys off the user — the domain stores still hold shared mock data
      rather than per-account data. Clearing them is what `signOut` grows when
      that changes

### `Drawer.Protected` rather than a redirect

expo-router 57 ships `Protected` on `Stack`, `Tabs` **and** `Drawer`
(`node_modules/expo-router/build/layouts/DrawerClient.d.ts:107`), which is the
current documented auth pattern. `AppLayout` wraps its screens in two guards:

```tsx
<Drawer.Protected guard={isSignedIn}>   {/* home, contacts, groups, … */}
<Drawer.Protected guard={!isSignedIn}>  {/* login */}
```

- [x] Inverse guards, so the two sets are never both present
- [x] Login keeps `headerShown: false`, `swipeEnabled: false` and the hidden
      drawer item. Being the only screen is not the same as being safe — without
      these it renders a hamburger into an app the user has not entered
- [x] `Login` and `Settings` call `signIn` / `signOut` and **do not navigate**.
      Flipping the guard is what moves the user

This is the reason the `app/` restructure the original doc predicted ("a route
group with login outside the drawer") was not needed. `Protected` removes the
screens from the navigator outright, so login being a drawer sibling costs
nothing — no files moved, and `EAppRoute` / `EDrawerScreen` keep their pairing.

Two behaviors that come from `Protected` rather than from any code here:

- **History is dropped.** When a guard goes false, expo-router removes that
  screen *and all of its history entries*, so signing out cannot be undone with
  the back button, and signing in cannot be backed out of into the form.
- **The redirect target is the anchor route** — the drawer's `index`, i.e.
  Home — or the first remaining screen. SDK 58 adds a `redirectTo` prop to
  override this; **57 does not have it**, so the anchor is what we get.

### Sign out

- [x] An Account card in Settings: the username, a hint, and a danger-outlined
      Sign out button
- [x] A Sign out row pinned to the **bottom of the drawer**, added afterwards on
      request — this is where users look for it

Neither was in the original ask, but a gate with no exit is half a feature:
without one, login is unreachable after the first sign-in except by reloading.

The drawer row is a sibling of `DrawerContentScrollView`, not a child, so it
stays pinned to the bottom instead of trailing the end of the item list. Three
things it has to get right:

- [x] `props.navigation.closeDrawer()` **before** `signOut()`. Signing out swaps
      the drawer's screens for the login route, and an open drawer would
      otherwise hang over it showing an empty menu. This is the one place that
      needs it, since a sign-out is not itself a navigation action the drawer
      would close for
- [x] Bottom inset padding via `getDrawerFooterStyle` —
      `DrawerContentScrollView` applies the inset to its own content, and this
      row sits outside it, so it would otherwise land under the home indicator
- [x] Hidden when signed out. The drawer content component still renders while
      login is the only screen; the drawer is unreachable there (no toggle, no
      swipe), but a sign-out row with nobody to sign out is nonsense regardless

**Two sign-out affordances now exist.** The drawer row is the discoverable one;
the Settings card is the only thing that shows *who* is signed in. Worth a
decision: keep both, or drop the Settings button and leave that card as a
read-only "signed in as".

## Follow-on: the mock account

The gate above let anyone in, which made "signed out" a state you could only
reach by reloading. One fixture account fixes that and makes the rejection path
real.

### `src/data/user.ts`

- [x] `MOCK_USER: TCredentials = { username: 'jjiracek', password: 'Password1!' }`,
      sitting beside `MOCK_CONTACTS` / `MOCK_GROUPS` / `MOCK_LOCATIONS` as the
      app's fourth piece of seed data
- [x] `TCredentials` in `common.types.ts`, separate from `TAuthUser` — the
      session user must never carry a password field, or it becomes something a
      screen can render by accident

**This is a fixture, not authentication.** The password is in the bundle in
plain text and compared with `===`. That is only acceptable because there is
nothing behind it; when step 04 introduces a server, `src/data/user.ts` gets
**deleted rather than hardened**, and the on-screen hint goes with it.

### `signIn` returns a verdict

- [x] `signIn(credentials): boolean` — compares both halves, returns whether the
      pair matched
- [x] The rejection says only that *the pair* failed, never which half. Reporting
      "no such user" separately from "wrong password" turns a login form into a
      way to enumerate accounts — worth getting right in the fixture, since this
      is the shape step 04 inherits
- [x] `user` is set from the username alone. What the form collected stops in
      the store

Returning a boolean rather than storing an error is deliberate: a rejected
sign-in is a fact about one submit, not app state. Keeping it in the store would
mean remembering to clear it on unmount.

### The form renders the failure

- [x] `setError('root', { message: msg('credentialsInvalid') })` — form-level,
      not field-level, since the schema cannot know it and blaming either input
      would leak which half was wrong
- [x] Rendered above the submit button through the same `translateFieldError`
      the fields use, with `accessibilityLiveRegion="polite"`
- [x] `clearErrors('root')` at the top of `handleLogin`, so a second attempt
      never shows the first one's message. Explicit rather than trusting
      `handleSubmit` to drop root errors on its own
- [x] `credentialsInvalid` in both locales
- [x] `signInHint` now names the demo account by interpolating `MOCK_USER`
      rather than repeating the literals in two locale files — otherwise the
      credentials live in three places and the hint drifts
- [x] The submit log drops the password entirely — not its value, and no longer
      its length either

## Follow-on: idle timeout

Ten minutes without a touch signs the user out. Three pieces:
`src/constants/idleTimeout.ts` (`IDLE_TIMEOUT_MS`), `src/hooks/useIdleTimeout.ts`
(the timing), and `src/components/common/IdleTimeoutBoundary.tsx` (the touch
listener, wrapping `AppDrawer` in `AppLayout`).

### Wall clock, not timer time

The obvious implementation — arm a `setTimeout`, clear and re-arm it on every
touch — is wrong in the most ordinary case there is. **JS is suspended while the
app sits in the background**, so a timer armed for ten minutes does not fire
during a twenty-minute detour into another app, and the user comes back still
signed in. That is the single case an idle timeout most needs to cover.

- [x] Every check recomputes `Date.now() - lastActivity` rather than trusting
      that a timer's elapsed time means anything
- [x] An `AppState` listener re-runs the check on each return to `active`, which
      is where a long absence signs the user out immediately. Only `active` is
      handled — time in the background is *not* activity, so there is nothing to
      do when leaving

- [x] The timer **reschedules itself** instead of being reset per touch: when it
      fires early it re-arms for whatever is left of the window. Activity then
      costs one ref write and no timer churn, which matters because
      `onMoveShouldSetPanResponderCapture` fires continuously during a scroll

### Observing touches without stealing them

- [x] `PanResponder` with both capture handlers returning **`false`** — the
      responder system asks on the way *down* the tree, the boundary records the
      touch and declines it, and the gesture carries on to the button or scroll
      view that actually wanted it. Returning `true` anywhere here would make
      the whole app unusable
- [x] Start *and* move are both listened for; dragging a list is activity and
      never begins a new touch

### Wiring

- [x] Wraps `AppDrawer` inside `SettingsProvider`, not any one screen — idleness
      is a property of the session, and the countdown has to outlive whatever is
      rendered
- [x] `enabled: isSignedIn`, so nothing runs while signed out and the countdown
      restarts from the moment of sign-in rather than from a stale timestamp
- [x] `onIdle` calls `authStore.signOut()` — no navigation. The redirect is the
      same `Drawer.Protected` flip a manual sign-out uses
- [x] `onIdle` is held in a latest-ref inside the hook, so passing an inline
      function cannot restart the countdown on every render — which would
      postpone the deadline forever and silently disable the feature
- [x] A `signedOutIdle` toast, in both locales. A session that ends by itself has
      to say so, or the user lands on a login form with no account of what
      happened. `Toast` is mounted above the drawer, so the banner survives the
      screens being swapped out underneath it

The copy says "due to inactivity" rather than naming ten minutes, so changing
`IDLE_TIMEOUT_MS` cannot leave the toast advertising a duration the app no
longer uses. It renders in `colors.success` like every other toast — the wrong
semantic colour for this message, but `Toast` has no variants and adding them
for one string is not worth it yet.

### The known gap

**Typing is not activity.** Keystrokes into a focused `TextInput` are not touch
events, so a long enough pause mid-form counts as idle even though the user is
plainly there. The tap that focused the field registers, and every form in this
app is short, so closing it — a `Keyboard` listener, or `onChangeText` threaded
through `FormTextField` — has not been worth the wiring. It becomes worth it the
moment a long free-text field exists.

## Deliberately not changing

- **Persistence.** `authStore` is in-memory like every other store, so a reload
  signs the user out and returns them to login. That is the same "no persistence
  yet" caveat contacts, groups and theme all carry — it is just far more visible
  here, because it shows up on launch rather than after a save. The fix is
  `expo-secure-store` for the token plus zustand's `persist` middleware, and it
  should land with the real credentials rather than before them.
- **Real credentials.** One hardcoded pair is the whole account system: no
  registration, no password reset, no second user, no hashing, no rate limiting
  on repeated attempts. All of that needs the backend
  `04_event_creation_api.md` describes, and building any of it against a
  fixture would mean writing it twice.
- **"Forgot password" / "Create account".** Both need destinations that don't
  exist.
- **Treating `Protected` as access control.** It is not, and the Expo docs say
  so outright: "Protected screens are not a replacement for server-side
  authentication or access control." It decides what *renders*. Every rule that
  actually matters belongs on the server step 04 introduces.
- **Clearing domain stores on sign out.** Contacts, groups and locations are
  shared mock seed data, not one user's records, so wiping them on `signOut`
  would delete the fixtures the app is demoed with. It becomes correct the
  moment that data is per-account.
- **Unsaved-changes guard.** Still absent app-wide, and genuinely irrelevant
  here — abandoning a half-typed login is the intended exit.
- **`FormScreen` reuse.** Argued above. If a *third* headerless full-page form
  ever appears, the shared piece to extract is the
  `SafeAreaView`/`KeyboardAvoidingView`/`ScrollView` sandwich, not a mode flag
  on `FormScreen`.

## Verification

Typed routes are on, so `.expo/types/router.d.ts` must regenerate before
`/login` typechecks.

- [x] `npx expo start` once to regenerate route types, then `npx tsc --noEmit`.
      `TRoutesInSync` fails here if only one of the two enums was updated —
      `router.d.ts` now carries `/login` and `tsc` is clean

Everything below is a device walk-through and is **still open** — none of it has
been run.

Gating:

- [ ] **Cold start**: launch the app signed out and confirm it opens on login,
      not Home. No header, no hamburger, and an edge-swipe from the left must
      not open the drawer
- [ ] **Deep link while signed out**: `npx uri-scheme open barsignal://contacts
      --ios` must land on login rather than on contacts or a blank screen. Same
      for `barsignal://settings`
- [ ] **Sign in**: a valid pair lands on Home with no manual navigation, and the
      Android back button / iOS swipe do **not** return to the form — this is
      `Protected` dropping login's history entries
- [ ] **Sign out (drawer)**: open the drawer, tap Sign out at the bottom, and
      confirm the drawer closes as it goes rather than being left open over the
      login screen. Back must not re-enter the app
- [ ] **Sign out (Settings)**: Settings → Account → Sign out does the same
- [ ] **Drawer footer geometry**: on a device with a home indicator, the Sign out
      row clears it; with the menu scrolled, the row stays pinned to the bottom
      rather than moving with the item list
- [ ] **Reload signs you out**: shake → Reload and confirm it comes back on
      login. Expected, not a bug — `authStore` is in-memory

Idle timeout — temporarily drop `IDLE_TIMEOUT_MS` to ~15s to make these
runnable, and put it back afterwards:

- [ ] **Idle**: sign in, leave the app untouched, and confirm it drops to login
      with the "Signed out due to inactivity" toast
- [ ] **Activity defers it**: keep tapping and scrolling past the window and
      confirm it does *not* sign out
- [ ] **Nothing is swallowed**: every button, the drawer swipe, list scrolling
      and text fields all still work with the boundary in place — this is what
      the `false` returns buy
- [ ] **Background counts**: sign in, background the app for longer than the
      window, reopen, and confirm it is on login. This is the case a plain
      `setTimeout` gets wrong
- [ ] **Short background does not**: background for well under the window,
      reopen, and confirm the session survives
- [ ] **Not armed while signed out**: sit on the login screen for longer than the
      window and confirm nothing happens — no toast, no churn
- [ ] **Restarts on sign-in**: sign out manually, wait past the window, sign back
      in, and confirm the new session is not immediately ended by the old
      timestamp
- [ ] **Drawer menu**: open the drawer while signed in and confirm there are
      still exactly five items and none of them is "login"
The form itself:

- [ ] **Validation**: submit empty — both fields show their message and get the
      danger border. Type into username, blur, confirm its message clears while
      password's stays (this is `mode: 'onTouched'`)
- [ ] **Masking**: the password field renders dots, and the username field does
      not
- [ ] **Autofill**: iOS offers a saved password for the pair rather than the
      plain keyboard bar
- [ ] **Correct pair**: `jjiracek` / `Password1!` signs in
- [ ] **Wrong pair**: `jjiracek` / `Password1` is rejected with the form-level
      message above the button, and the message names neither field. Same for a
      bad username with the right password — the copy must be identical, or the
      form tells an attacker which usernames exist
- [ ] **Retry clears**: after a rejection, submit a correct pair and confirm the
      old message is gone rather than flashing alongside the redirect
- [ ] **Password whitespace**: type `Password1!` with a trailing space and
      confirm it is **rejected** — this is what skipping `.trim()` buys, and it
      is now directly observable. `  jjiracek  ` with surrounding spaces must
      still be **accepted**, since the username *is* trimmed
- [ ] **Keyboard**: focus password on iOS and confirm the Sign in button is
      still reachable, and that tapping it submits on the first tap rather than
      just dismissing the keyboard
- [ ] **Account card**: Settings shows the username that was typed on login, and
      the Sign out button is danger-coloured in both themes
- [ ] **Language**: switch to Spanish in Settings, sign out, and confirm the
      login labels, button, hint and both validation messages are translated —
      then sign back in and check the Account card copy too
- [ ] **Theme**: toggle light mode and confirm the screen has no hardcoded
      colors — it should follow like every other screen
- [ ] **Create regression**: `/contacts/new` still masks nothing and still
      scrolls to the first error, after the two new `FormTextField` props
