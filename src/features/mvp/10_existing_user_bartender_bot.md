# Existing-user Bartender Bot

## Phase 1 ✅ — personalized greeting for the floating-button entry point

**Date**: 2026-10-05

**Status**: Phase 1 complete.

## Scope

- The floating button on Home ([BartenderBotButton.tsx](../../components/_Home/BartenderBotButton.tsx))
  pushes `EAppRoute.BARTENDER_BOT` with no welcome param, which is the
  existing-signed-in-user flow — distinct from the new-account welcome
  questionnaire covered in [09_bartender_bot.md](09_bartender_bot.md) (reached
  only via the `justSignedUp` redirect with the welcome param set).
- That entry point's single bot bubble changed from the static placeholder
  copy (`bartenderBotHello`, "Hello World") to a personalized greeting that
  reads the signed-in user's first name off `authStore` and asks what's on
  their mind: `bartenderBotReturningGreeting` ("Hey there, {{firstName}}!
  What's on your mind?"), following the same `useAuthStore((state) =>
  state.user?.firstName ?? '')` read Profile already uses.
- `bartenderBotHello` was removed from `en.json`/`es.json` since nothing else
  referenced it.

### Not covered (deferred)

- No input composer renders after the greeting — same dead-end placeholder
  shape Phase 1 of `09_bartender_bot.md` established, just with a
  personalized message instead of "Hello World". Letting the user actually
  type a free-form message (and any bot reply to it) is explicitly out of
  scope for this update.
- Any real bot logic/NLP for a typed message.

## Phase 2 ✅ — a four-option menu, driven by chat (not navigation)

**Date**: 2026-10-05

**Status**: Phase 2 complete.

### Scope

- Reverses Phase 1's "no input composer" deferral: the returning-greeting
  bubble is now followed (after the usual typing-indicator pause) by a
  `bartenderBotMenuPrompt` bot bubble and a four-button menu — help set up
  profile, add a contact, add a location, add a group — rendered by a new
  [ChatOptionList.tsx](../../components/BartenderBot/ChatOptionList.tsx)
  (a vertical stack of tappable rows, replacing the composer the same way
  `FinishActions` already does for the welcome flow's end state).
- Tapping an option drives the rest of that action **in the chat transcript
  itself** — no navigation to Profile or to `/contacts/new` etc. This was a
  deliberate choice over reusing `ENestedRoute`/`RETURN_TO_PARAM` (the pattern
  Home's bottle/tap/keg affordances use): the request was for the bot to ask
  the questions itself, not hand off to the existing forms.
  - **Profile**: reuses the exact `stepConfigs` (prompt/validator/setter/ack
    keys) the new-account questionnaire already has for email, phone,
    favorite drink and favorite shot, but only asks about whichever of those
    four are still blank on `authStore.user` — no re-asking something already
    set. Once the (possibly empty) queue is exhausted, `bartenderBotEditPrompt`
    offers a second `ChatOptionList` naming each of the four fields plus a
    "No thanks, that's all" row; picking a field re-asks that single question
    (submit-only, no skip) and loops back to the same edit menu, so several
    fields can be changed in one visit. "No thanks" returns to the main menu.
  - **Add a contact**: asks first name then last name (both required, not
    skippable — the one rule `contactFormSchema` actually enforces). A
    duplicate name (checked with the existing `contactNameKey` helper against
    `contactsStore.contacts`) re-asks the first name with an explanation
    rather than silently failing. A clean pair calls `contactsStore.addContact`
    directly with every other field blank (`email`, `phone`, the address
    parts, `favoriteBarId`) — same shape `CreateContact` builds, minus the
    optional fields this flow doesn't ask for.
  - **Add a location**: asks name then address line 1 (both required, mirroring
    `locationFormSchema`), then calls `locationsStore.addLocation` with the
    remaining address parts blank and coordinates from the same random-Gotham-
    area helper `CreateLocation` used. That helper moved to
    [locationFormat.ts](../../utils/locationFormat.ts) as
    `getRandomLocationCoordinates()` so both call sites share it instead of
    carrying their own copy of the lat/long ranges.
  - **Add a group**: if `contactsStore.contacts` is empty, says so
    (`bartenderBotGroupNeedsContacts`) and returns straight to the main menu —
    a group needs at least one member, same rule `groupFormSchema` enforces,
    and there's nothing to build a group from yet. Otherwise asks for a name,
    then shows every contact as a tappable chip via a new
    [ChatMultiSelect.tsx](../../components/BartenderBot/ChatMultiSelect.tsx)
    (toggle chips + a Done button disabled until at least one is selected),
    then calls `groupsStore.addGroup` with the resolved `TContact` copies —
    same `contactIds` → `TContact[]` resolution `CreateGroup` does.
  - Every free-text answer (contact/location names, the group name) runs
    through the same `containsProfanity` check and bot pushback the welcome
    questionnaire already uses, so the rule is consistent everywhere in this
    screen rather than only on the four original fields.
  - Finishing any of the four actions (or being told there are no contacts
    yet) ends with a confirmation bubble and a return to the main menu, so
    the conversation can keep going — there is no final "you're done" state
    the way the welcome questionnaire has one.
- `ChatComposer`'s `onSkip`/`skipLabel` became optional — the Skip button now
  only renders when a caller actually passes `onSkip`, which is what lets the
  contact/location/group name steps (all required, unlike the profile
  questionnaire's skippable fields) reuse the same composer component without
  a Skip button that would do nothing.
- New shared types in
  [bartenderBot.types.ts](../../types/bartenderBot.types.ts): `TMenuOptionId`,
  `TReturningStage` (which bottom-docked control is currently showing),
  `TReturningComposerConfig` (drives `ChatComposer` generically the same way
  `TWelcomeStepConfig` already does for the welcome flow), and `TChatOption`
  (one row shared by `ChatOptionList` and `ChatMultiSelect`).
- New i18n keys — `bartenderBotMenuPrompt`, the four
  `bartenderBotMenuOption*` labels, `bartenderBotProfileAllSet`,
  `bartenderBotEditPrompt`, `bartenderBotEditDone`,
  `bartenderBotAskContactFirstName`/`LastName`, `bartenderBotContactNameTaken`,
  `bartenderBotContactAdded`, `bartenderBotAskLocationName`/`Address`,
  `bartenderBotLocationAdded`, `bartenderBotAskGroupName`,
  `bartenderBotGroupNeedsContacts`, `bartenderBotGroupPickMembers`,
  `bartenderBotGroupAdded`, and a generic `done` (the multi-select's Done
  button) — in both `en.json` and `es.json`.

### Not covered (deferred)

- Any real NLP — this is still a fixed menu of four scripted actions, not the
  "write my own AI stuff" the feature request named as the eventual goal.
- The contact/location flows only collect the required fields; email, phone,
  nickname, full address and favorite-bar stay unset and are only editable
  later from the Contacts/Locations screens themselves.
- Editing or deleting a contact/location/group from inside the chat — this
  phase only adds.
- A "go to Home" exit from the menu loop itself; the user leaves the bot via
  the drawer the same way Profile/Settings already work.
