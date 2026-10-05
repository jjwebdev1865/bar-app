# Bartender bot

## Phase 1 ✅ — floating button + placeholder screen

**Date**: 2026-10-02

**Status**: Phase 1 complete.

## Scope

- Phase one of the Bartender Bot feature: a small circular floating button
  pinned to the bottom-right of the Home screen. Tapping it pushes a new
  screen that only renders "Hello World" for now — no chat UI, no bot logic.
- New component [BartenderBotButton.tsx](../../components/_Home/BartenderBotButton.tsx),
  exported from `src/components/_Home`'s barrel and rendered inside
  [Home.tsx](../../pages/Home/Home.tsx), absolutely positioned over the
  screen's content.
- New route: `EAppRoute.BARTENDER_BOT` / `EDrawerScreen.BARTENDER_BOT`
  (`/bartender-bot`), plus
  [app/bartender-bot.tsx](../../../app/bartender-bot.tsx) delegating to
  [src/pages/BartenderBot/BartenderBot.tsx](../../pages/BartenderBot/BartenderBot.tsx),
  following the same thin-route pattern as the other screens.
- Drawer wiring in [AppLayout.tsx](../../navigation/AppLayout.tsx): registered
  as a `Drawer.Screen` hidden from the menu via `drawerItemStyle` (same
  pattern as Profile/Settings), since it's reached only from Home's floating
  button, not from the drawer list. The default header (hamburger +
  `DrawerToggleButton`) is left in place rather than wired to a back button,
  so returning to Home works the same way Profile/Settings already do.
- New i18n keys (`bartenderBot`, `openBartenderBot`, `bartenderBotHello`) in
  both `en.json` and `es.json`.

## Not covered (deferred)

- Any actual bot behavior, chat interface, or backend wiring — the pushed
  screen is a placeholder.
- Button placement on screens other than Home.

## Phase 2 ✅ — new-account welcome

**Date**: 2026-10-02

**Status**: Phase 2 complete.

### Scope

- A brand-new account (`CreateAccount` → `authStore.signUp`) is greeted by
  the Bartender Bot instead of landing straight on Home: a hello/welcome
  message, a line noting the bot will explain the project in a later phase,
  and a button to go fill out the profile. An existing account signing in
  (`signIn`) still lands on Home as before — this is new-account-only, per
  the phase 1 doc's scope decision.
- [BartenderBot.tsx](../../pages/BartenderBot/BartenderBot.tsx) now branches
  on a `BARTENDER_BOT_WELCOME_PARAM` search param (`src/constants/routes.ts`):
  absent, it still renders phase 1's plain "Hello World" (the floating
  button's entry point); present, it renders the welcome copy
  (`bartenderBotWelcomeGreeting`, `bartenderBotWelcomeIntro`) plus a way to
  start filling out the profile (see the same-day update below for what that
  became).
- **Why the redirect happens from `Home`, not from `CreateAccount` directly**:
  `signUp` flips `authStore.user`, which is what flips `AppLayout`'s
  `Drawer.Protected` guard from the signed-out screen set to the signed-in
  one. Pushing `EAppRoute.BARTENDER_BOT` from inside `CreateAccount`'s submit
  handler would race that guard swap — the target screen isn't mounted yet
  in the same synchronous call. Instead, `signUp` sets a new `justSignedUp`
  flag; `Home` (the guard's anchor route, so always mounted first) reads it
  in a `useEffect` and immediately pushes on to `/bartender-bot` with the
  welcome param, then clears the flag via `clearJustSignedUp`. `signOut`
  also resets the flag defensively.
- New i18n keys (`bartenderBotWelcomeGreeting`, `bartenderBotWelcomeIntro`)
  in both `en.json` and `es.json`.

### Not covered (deferred)

- Any real explanation of the project — the intro line only promises it's
  coming later.
- Actual profile-completion guidance beyond the button; the Profile screen
  itself is unchanged.

## Update (2026-10-02, same day): ask favorite drink instead of a plain profile link

- The welcome screen's button no longer just links to Profile. It now asks
  the favorite-drink question directly: a `TextInput` (styled like Profile's
  own favorite-drink field) plus a submit button, disabled until the field is
  non-empty.
- Submitting calls `authStore.setFavoriteDrink` — the same action and field
  Profile's Favorites section edits, so a value set here shows up there —
  then raises a `favoriteDrinkSaved` toast and pushes `EAppRoute.PROFILE` so
  the user can finish the rest of the profile. This replaces the earlier
  `bartenderBotGoToProfile` button entirely rather than sitting alongside it.
- New i18n keys (`bartenderBotAskFavoriteDrink`, `favoriteDrinkSaved`,
  `submit`) in both `en.json` and `es.json`; `bartenderBotGoToProfile` was
  removed since nothing renders it anymore.

### Not covered (deferred)

- Any real explanation of the project — the intro line only promises it's
  coming later.
- Actual profile-completion guidance beyond the button; the Profile screen
  itself is unchanged.

## Update (2026-10-02, same day): ask favorite shot next

- The favorite-drink submit no longer pushes `EAppRoute.PROFILE` directly —
  it advances a local `step` (`'drink' | 'shot'`) to a second question
  instead, same layout (label, `TextInput`, submit button disabled until
  non-empty).
- Favorite-shot submit calls `authStore.setFavoriteShot` (same field
  Profile's Favorites section edits) and raises a `favoriteShotSaved` toast.
- New i18n keys (`bartenderBotAskFavoriteShot`, `favoriteShotSaved`) in both
  `en.json` and `es.json`. `favoriteShot`'s existing label/placeholder string
  is reused, same as `favoriteDrink` was for the first question.

## Update (2026-10-02, same day): land on Home after the shot, not Profile

- Favorite-shot submit now pushes `EAppRoute.HOME` instead of
  `EAppRoute.PROFILE` — the questionnaire is the profile-completion step now,
  so there's nothing left to send the user to Profile for.

## Update (2026-10-05): optional email step before the favorite-drink question

- The questionnaire's `step` type grew a new first value, `'email'`, ahead of
  `'drink'` and `'shot'`. It asks whether the user wants to add an email
  (`bartenderBotAskEmail`) above a `TextInput`, with a "Skip" button and a
  "Submit" button below it — skip advances to `'drink'` without writing
  anything, submit is disabled until the value parses with zod's
  `z.email()` (same rule `contactFormSchema` uses), then calls the new
  `authStore.setEmail`, raises an `emailSaved` toast, and advances to
  `'drink'` the same way the drink/shot steps already chain.
- `authStore` grew `setEmail`, following the exact no-op-when-signed-out
  pattern as `setFavoriteDrink`/`setFavoriteShot` — the same `TAuthUser.email`
  field Profile's Bio section already reads, so a value set here shows up
  there immediately.
- New i18n keys (`bartenderBotAskEmail`, `emailSaved`, `skip`) in both
  `en.json` and `es.json`.
- New `secondaryButton`/`secondaryButtonLabel` styles (outline, accent border)
  for the "Skip" button — the first place this screen needed a non-primary
  button.

### Not covered (deferred)

- Editing the email again later from Profile — Profile's Bio section still
  only displays `email`, it doesn't yet expose a way to change it post-signup.

## Update (2026-10-05, same day): optional phone step after email

- `step` grew `'phone'` between `'email'` and `'drink'`. Same shape as the
  email step — label (`bartenderBotAskPhone`) above a `TextInput`, Skip and
  Submit in a row below it (now the second screen using `buttonRow`) — but
  the input is masked with the existing `formatPhoneInput` on every keystroke
  and validated with `phoneDigits(...).length === PHONE_DIGIT_COUNT`, the
  same helpers `contactFormSchema` and the contact create/edit forms already
  use, rather than a bespoke regex.
- Skip advances straight to `'drink'` without writing anything; Submit is
  disabled until 10 digits are present, then calls the new
  `authStore.setPhone`, raises a `phoneSaved` toast, and advances to
  `'drink'`.
- `authStore` grew `setPhone`, identical no-op-when-signed-out shape as
  `setEmail`/`setFavoriteDrink`/`setFavoriteShot` — writes `TAuthUser.phone`,
  the same field Profile's Bio section already reads.
- New i18n keys (`bartenderBotAskPhone`, `phoneSaved`) in both `en.json` and
  `es.json`; `phone`'s existing label/placeholder is reused, same as
  `favoriteShot` was for the shot question.

### Not covered (deferred)

- Editing the phone number again later from Profile — same gap as email,
  Profile's Bio section only displays it today.

## Update (2026-10-05, same day): favorite drink and shot are skippable too

- The last two steps — `'drink'` and `'shot'` — grew the same Skip/Submit
  `buttonRow` the email and phone steps already use, instead of a lone
  Submit button. The whole questionnaire is now consistently skippable
  question by question rather than only its first two steps.
- `skipFavoriteDrink` advances to `'shot'` without writing anything, same as
  `skipEmail`/`skipPhone`. `skipFavoriteShot` pushes `EAppRoute.HOME`
  directly — the same destination `submitFavoriteShot` already pushed to,
  since `'shot'` is the last step and has nowhere further to skip *to*.
- No new i18n keys — both reuse the existing `skip` key.

## Phase 3 ✅ — chat-style transcript

**Date**: 2026-10-05

**Status**: Phase 3 complete.

### Scope

- Replaces the "swap the whole screen per step" questionnaire with a chat
  transcript: every bot prompt and every user answer (or skip) is now a
  bubble appended to a scrolling list, with an input bar docked to the
  bottom instead of a single centered field. Applies to both the welcome
  questionnaire and the plain floating-button entry point — the latter now
  renders its `bartenderBotHello` copy as a single bot bubble in the same
  transcript UI rather than a centered `Text`.
- New components under `src/components/BartenderBot/` (barrel
  [index.ts](../../components/BartenderBot/index.ts)):
  [ChatBubble.tsx](../../components/BartenderBot/ChatBubble.tsx) (one message,
  left/panel-colored for the bot, right/accent-colored for the user),
  [TypingIndicator.tsx](../../components/BartenderBot/TypingIndicator.tsx) (a
  bot-styled "•••" bubble shown while the next question is pending),
  [ChatTranscript.tsx](../../components/BartenderBot/ChatTranscript.tsx) (a
  `FlatList` of bubbles that auto-scrolls to the end on every new message or
  typing-state change), and
  [ChatComposer.tsx](../../components/BartenderBot/ChatComposer.tsx) (the
  bottom-docked `TextInput` + Skip/Submit row, wrapped in a
  `KeyboardAvoidingView` so it clears the keyboard).
- New shared types in
  [bartenderBot.types.ts](../../types/bartenderBot.types.ts): `TChatSender`,
  `TChatMessage`, `TWelcomeStepId` (renamed from the page-local
  `TWelcomeStep`), and `TWelcomeStepConfig` — exported through the `src/types`
  barrel per the usual convention.
- [BartenderBot.tsx](../../pages/BartenderBot/BartenderBot.tsx) was rewritten
  around this transcript: the four near-identical JSX blocks for
  email/phone/drink/shot (phases 1–2) collapse into one `stepConfigs` record
  keyed by `TWelcomeStepId`, each entry holding its prompt key, field label
  key, keyboard type, optional input formatter, validator, store setter,
  saved-toast key, and the next step. `ChatComposer` renders generically off
  whichever step is current rather than branching per field. This is the
  non-trivial refactor this phase's scope note is for — no behavior changed
  for any individual question (same validators, same store setters, same
  toasts), only how the four steps share their rendering.
- Pacing: advancing to a step shows the typing indicator for a fixed
  `BOT_TYPING_DELAY_MS` (600ms) before the next bot bubble lands and the
  composer re-enables for it, so the bot's side of the conversation reads as
  responses rather than instant screen swaps. The same delay runs after the
  final step (`'shot'`) completes, before `router.push(EAppRoute.HOME)`, so
  the last answer bubble isn't ripped away the instant it appears.
- Skipping a step now appends a `bartenderBotSkippedAnswer` ("Skipped") user
  bubble before advancing, so the transcript stays a complete record of what
  happened rather than silently jumping ahead.
- New i18n keys (`chatYouLabel`, `bartenderBotTyping`,
  `bartenderBotSkippedAnswer`) in both `en.json` and `es.json` — the first two
  back each bubble's/typing-indicator's `accessibilityLabel` ("Bartender Bot:
  …" / "You: …", "Bartender Bot is typing"), reusing the existing
  `bartenderBot` key for the bot's half of that label.

### Not covered (deferred)

- Any real bot logic/NLP — the transcript is still a fixed four-step
  questionnaire, just presented as chat.
- Persisting the transcript across remounts/navigation — it resets the same
  way the old step state did.
- Entrance animations beyond the typing-indicator pause, and voice input.

## Update (2026-10-05, same day): drop the per-submission success toast

- Submitting an answer no longer raises a toast (`emailSaved`, `phoneSaved`,
  `favoriteDrinkSaved`, `favoriteShotSaved`) on top of appending the user's
  bubble to the transcript — the bubble itself is the confirmation that the
  answer landed, so the toast was redundant in the chat UI. Skipping a step
  was already toast-free; submitting now matches it.
- `TWelcomeStepConfig` dropped its `savedToastKey` field, `BartenderBot.tsx`
  dropped its `useToastStore`/`showToast` usage, and the four now-unused
  `*Saved` i18n keys were removed from `en.json` and `es.json` rather than
  left dangling.

## Update (2026-10-05, same day): Submit button reads "Send"

- The `submit` i18n key's English copy changed from "Submit" to "Send" — a
  chat composer sends a message, it doesn't submit a form. `es.json` already
  read "Enviar" ("Send"), so only `en.json` changed.

## Update (2026-10-05, same day): friendly sign-off, lands on Profile again

- `finishWelcome` (reached when the favorite-shot step is submitted *or*
  skipped) now pushes one more bot bubble — `bartenderBotFinishing` — before
  navigating anywhere: a friendly "your profile is on its way, hold on a
  second" line, following the typing-indicator pause the same way every other
  bot bubble does. A second `BOT_TYPING_DELAY_MS` pause follows the message
  before the navigation fires, so it has a moment to be read.
- That navigation now targets `EAppRoute.PROFILE` instead of
  `EAppRoute.HOME` — this reverses the "land on Home after the shot, not
  Profile" decision from earlier in phase 2, since the questionnaire now ends
  with copy that explicitly promises the profile is being finished, which
  reads oddly if the very next screen isn't Profile.
- New i18n key (`bartenderBotFinishing`) in both `en.json` and `es.json`.

## Update (2026-10-05, same day): let the user choose Home or Profile

- Replaces the auto-navigate-to-Profile behavior from the update above:
  once `bartenderBotFinishing` lands, the composer area is replaced by a new
  [FinishActions.tsx](../../components/BartenderBot/FinishActions.tsx) —
  two docked buttons, "Go to Home" and "Go to Profile" — instead of
  `finishWelcome` silently calling `router.push` on a timer. Nothing
  navigates until the user picks one.
- `BartenderBotScreen` grew an `isFinished` boolean flipped once the sign-off
  bubble lands; the render picks between `ChatComposer` (a step is active),
  `FinishActions` (`isFinished`), or nothing, the same three-way branch
  shape the step/finished state already implied.
- New i18n keys (`bartenderBotGoHome`, `bartenderBotGoProfile`) in both
  `en.json` and `es.json`.


