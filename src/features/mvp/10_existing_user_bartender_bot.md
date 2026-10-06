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

## Update (2026-10-06): reset the conversation every time the screen refocuses

- Bug: `/bartender-bot` is a `Drawer.Screen`, so navigating away from it (back
  to Home, say) and reopening it via the floating button did not remount the
  screen — Drawer screens stay mounted once visited, the same reason
  `AppLayout.tsx` doesn't need `unmountOnBlur`. The chat transcript and
  whichever menu/questionnaire stage was active were still sitting there
  exactly as left.
- Fix: `BartenderBotScreen` (the default export, matching `app/bartender-bot.tsx`)
  is now a thin wrapper around the renamed `BartenderBotChat` (all the logic
  from Phases 1–2, unchanged) — it holds a `sessionKey` counter and bumps it
  from `expo-router`'s `useFocusEffect` every time the route (re)gains focus,
  rendering `<BartenderBotChat key={sessionKey} />`. Changing the `key` forces
  React to unmount and remount a fresh `BartenderBotChat` instance, which is
  what actually resets every piece of state (`messages`, `returningStage`, the
  profile/contact/location/group drafts, the typing timers) rather than
  threading a manual reset through each one.
- Why a remount instead of resetting state by hand inside one `useFocusEffect`:
  `useFocusEffect`'s callback must stay referentially stable (an empty
  `useCallback` dependency array) or the focus/blur subscription in its
  implementation re-fires on every render — including the renders a manual
  reset would itself trigger, risking a loop. A stable callback that only
  bumps a counter sidesteps that, and sidesteps every store value (`contacts`,
  `authStore.user`) the reset would otherwise have needed to read fresh rather
  than off a stale closure.
- Confirmed import: `useFocusEffect` comes from `expo-router` itself (it
  re-exports its own fork, not `@react-navigation/native`), consistent with
  the SDK 57 note on `usePreventRemove` in `01_React_Hook_Form.md`.

### Not covered (deferred)

- The welcome (`isWelcome`) flow resets the same way as a side effect of the
  shared wrapper, though in practice it is only ever visited once per sign-up
  and never revisited after `finishWelcome`'s Home/Profile buttons navigate
  away.

## Phase 3 ✅ — Contacts/Groups/Locations become Add/Edit/List submenus

**Date**: 2026-10-06

**Status**: Phase 3 complete.

### Scope

- The main menu's three list-backed options were relabelled from action
  phrases to plain domain nouns — `bartenderBotMenuOptionContact`/`Group`/
  `Location` now read "Contacts"/"Groups"/"Locations" instead of "Add a
  contact" etc. — and reordered to profile, Contacts, Groups, Locations.
  Tapping one no longer starts the Add flow directly; it opens a second
  `ChatOptionList` (`bartenderBotDomainMenuPrompt`, stage `'domainMenu'`) with
  three actions — Add, Edit, List — the same shape as the profile option's
  "want to edit anything?" menu, generalized to a domain so Phase 2's three
  Add flows (contact/location/group) didn't need rewriting, just re-triggering
  from `startDomainAdd` instead of from the main menu.
- **List**: if the domain's store array is empty, falls through to the new
  empty-state handling below. Otherwise joins every item's display name
  (`formatContactDisplayName`, or `.name` for groups/locations) into one bot
  bubble (`bartenderBotListResult`) and returns to the domain's Add/Edit/List
  menu.
- **Edit**: same empty-state fallback, otherwise a `ChatOptionList` of every
  existing item (stage `'editPick'`). Picking one pushes a multi-line bot
  bubble dumping every field already on file for it
  (`bartenderBotEditInfoPrefix` + one "Label: value" line per field, reusing
  existing field-label keys and `formatAddressSummary` for the address line),
  then `bartenderBotEditFieldPrompt` plus a `ChatOptionList` of the same
  fields `DOMAIN_EDIT_FIELDS` has for that domain (the two fields Add already
  collects — contact: first/last name; location: name/address; group:
  name/members) plus a "No thanks, that's all" row reusing
  `bartenderBotEditDone`. Only those fields are editable in chat, same
  required-fields-only scope Phase 2 chose for Add — nickname/email/phone/
  full address/favorite-bar stay screen-only edits.
  - Picking a text field re-asks the exact same prompt Add uses for it
    (`getEditFieldPromptKey`) and, on submit, merges just that field into the
    existing record before calling `updateContact`/`updateLocation`/
    `updateGroup` — every other saved field on the record is carried through
    untouched, unlike Add which starts the other fields blank. A contact name
    edit re-runs the same `contactNameKey` duplicate check Add uses, excluding
    the record being edited itself so renaming "Alice" to her own existing
    name isn't flagged as a collision.
  - Picking "Members" for a group skips the composer entirely and opens the
    existing `ChatMultiSelect` (stage `'editMembersSelect'`) pre-selected with
    the group's current member ids, so the chips show what's already in the
    group rather than starting empty the way Add's member picker does.
  - After any one field is updated, a `bartenderBotItemUpdated` ("Updated!")
    bubble lands and the field-picker menu re-shows (looping, same pattern
    `profileEditMenu` already used) so several fields can be changed in one
    visit; "No thanks, that's all" is what actually leaves, back to the
    domain's Add/Edit/List menu.
- **Empty domain** (Edit or List picked with nothing saved yet): a
  domain-specific `bartenderBotNoContactsYet`/`NoGroupsYet`/`NoLocationsYet`
  bubble, then a two-option `ChatOptionList` (stage `'domainEmptyMenu'`) —
  "Add one now" (jumps straight into that domain's Add flow) or "Back to main
  menu" (clears `activeDomain` and returns to the four-option main menu,
  the only place in this phase that exits the domain submenu loop entirely
  rather than returning to it).
- Finishing any Add (contact/location/group created) now returns to the
  domain's Add/Edit/List menu (`showDomainMenu`) rather than the main menu —
  the "return to where you were" rule this phase settled on, so adding a
  second contact right after the first doesn't require re-opening Contacts
  from the main menu each time.
- New shared types in `bartenderBot.types.ts`: `TDomainId` (`Exclude<TMenuOptionId, 'profile'>`)
  and `TDomainFieldId` (`'firstName' | 'lastName' | 'name' | 'address' | 'members'`);
  `TReturningStage` grew `'domainMenu'`, `'domainEmptyMenu'`, `'editPick'`,
  `'editFieldMenu'`, `'editFieldValue'`, `'editMembersSelect'`.
- New state on `BartenderBotChat`: `activeDomain`, `editingItemId`,
  `editingDomainFieldId` — `showMenu()` (the main-menu entry point) clears
  `activeDomain` defensively so nothing can carry a stale domain back into
  the four-option menu.
- New store reads: `locationsStore.locations`/`updateLocation`,
  `groupsStore.groups`/`updateGroup`, `contactsStore.updateContact` — Phase 2
  only needed each store's `add*` action.
- `getRandomLocationCoordinates` usage, duplicate-name checking, and the
  profanity filter are unchanged — this phase only adds Edit/List around the
  existing Add flows.
- New i18n keys — `bartenderBotDomainMenuPrompt`, `bartenderBotDomainAdd`/
  `Edit`/`List`, `bartenderBotListResult`, `bartenderBotNoContactsYet`/
  `NoGroupsYet`/`NoLocationsYet`, `bartenderBotAddNow`,
  `bartenderBotBackToMainMenu`, `bartenderBotEditPickPrompt`,
  `bartenderBotEditInfoPrefix`, `bartenderBotEditFieldPrompt`,
  `bartenderBotItemUpdated` — in both `en.json` and `es.json`; the three
  `bartenderBotMenuOption*` values changed in place rather than adding keys.

### Not covered (deferred)

- Deleting a contact/group/location from inside the chat — this phase only
  adds Edit (change a field) and List (read-only) around the existing Add.
- Editing the fields Add never collected (nickname, email, phone, full
  address, favorite bar) — still screen-only, same deferral Phase 2 made.
- Any confirmation before an edit overwrites a field — unlike the real forms,
  which show the previous value inline, the chat only shows it once in the
  info dump before asking for a new one.

## Update (2026-10-06): Edit's item picker is typed, not tapped

- The `'editPick'` stage (which contact/group/location to edit) switched from
  a `ChatOptionList` of tappable rows to a free-text `ChatComposer` — the bot
  asks `bartenderBotEditPickPrompt` and the user types the name rather than
  picking a button, matching how every other step in this chat answers
  questions by typing. `getReturningComposerConfig`'s new `'editPick'` case
  drives the composer with a generic `bartenderBotEditPickFieldLabel`
  ("Name") placeholder and a non-empty `isValid`, same shape every other
  required free-text step already uses.
- `handleReturningSubmit` matches the typed text against
  `getDomainItemOptions(domain)` by trimmed, case-insensitive label equality.
  A match proceeds exactly as the old button tap did — extracted into
  `proceedToEditItem(domain, itemId)`, the info dump followed by the
  field-picker menu. No match pushes `bartenderBotEditPickNotFound` ("I
  couldn't find one by that name — which one would you like to edit?") and
  returns to the same `'editPick'` stage so the user can try again, rather
  than falling back to the domain menu.
- `handleEditPickSelect` (the old `ChatOptionList` `onSelect` handler) and the
  `editPickOptions` array are gone along with the `'editPick'` branch in the
  render ternary — the generic composer branch (checked earlier in that
  ternary) now covers this stage the same way it covers every other
  free-text step.

### Not covered (deferred)

- Fuzzy or partial-name matching — the match is exact (trimmed,
  case-insensitive) against the full display name, so a typo or a
  first-name-only guess reads as "not found" rather than a near-match.

## Update (2026-10-06, same day): `startsWith` matching, and the field menu is typed too

- Exact-only matching from the update above was too strict for the thing it
  was meant to fix — typing "Bob" for a contact named "Bob Smith" read as
  "not found" since the label is "Bob Smith", not "Bob". `matchChatOption`
  (new module-level helper, `TChatOption[]` + the typed query in, a match /
  `'ambiguous'` / `null` out) now tries an exact case-insensitive match first,
  then falls back to `label.toLowerCase().startsWith(query)`; `'ambiguous'`
  when more than one option's label starts with the query and none matched
  exactly, so "Bob" still finds "Bob Smith" alone but asks the user to be
  more specific the moment a second Bob exists. `'editPick'` grew
  `bartenderBotEditPickAmbiguous` ("That matches more than one — can you be
  more specific?") alongside the existing not-found copy, both re-asking on
  the same stage.
- The `'editFieldMenu'` stage (which field to change, once an item's info
  dump has been shown) changed the same way Edit's item picker did: the
  `ChatOptionList` of field buttons is gone, replaced by a free-text
  `ChatComposer` — typing "First Name" (or "Last", `startsWith` catches it)
  selects that field via `matchChatOption` against the same
  `editFieldMenuOptions` array the old `ChatOptionList` rendered, including
  its synthetic "done" row. A match calls the new `applyEditFieldSelection`
  (lifted straight out of the old `onSelect` handler, minus the user-bubble
  echo — `handleReturningSubmit`'s shared code already pushes the raw typed
  text). No match pushes `bartenderBotEditFieldNotFound`; an ambiguous one
  pushes `bartenderBotEditFieldAmbiguous`; both re-ask on `'editFieldMenu'`.
  New `bartenderBotEditFieldLabel` ("Field") is the composer's placeholder,
  parallel to `'editPick'`'s `bartenderBotEditPickFieldLabel` ("Name").
- `getReturningComposerConfig` and `handleReturningSubmit` are now the only
  two places that know about either stage — `ChatOptionList` no longer
  appears anywhere in this file for Edit, only for the main menu, the
  profile edit menu, and the domain Add/Edit/List menu, none of which this
  update touched.

### Not covered (deferred)

- A literal "done"/"skip" typed shortcut for the field menu's exit row — it
  only matches by (a prefix of) its actual label, "No thanks, that's all".

## Update (2026-10-06, same day): a contact's Edit menu covers every field its info dump shows

- Bug: the info dump (`buildItemInfoText`) was already showing a contact's
  email, phone, address and favorite bar, but `DOMAIN_EDIT_FIELDS.contact`
  only listed `firstName`/`lastName` — typing "Email" at the field-menu
  prompt read as "not found" for a field the bot had just displayed.
  `TDomainFieldId` grew `'email' | 'phone' | 'favoriteBar'` (`'address'`
  already existed, reused from location) and `DOMAIN_EDIT_FIELDS.contact`
  now lists all six, so the editable set matches the displayed set exactly
  for every domain, not just location/group (which already matched).
- `getReturningComposerConfig`'s `'editFieldValue'` case special-cases each
  new contact field before falling back to the generic non-empty validator:
  email reuses `EMAIL_SCHEMA` but allows blank (clearing it, same as
  `contactFormSchema`); phone reuses `formatPhoneInput`/`phoneDigits` but
  also allows blank; address (`addressLine1`) is unconditionally valid,
  since it's optional on a contact unlike a location's required one;
  favorite bar requires non-empty text (resolved to a real location next).
- `handleReturningSubmit`'s `'editFieldValue'` case branches on `fieldId`
  inside the `domain === 'contact'` arm instead of always treating the
  input as a name-pair: email/phone/address just overwrite that one field,
  renaming logic (and its duplicate-name check) is unchanged and only runs
  for `firstName`/`lastName`. Favorite bar runs the typed text through
  `matchChatOption` against `locations` (same exact-then-`startsWith`
  matcher `'editPick'` uses) and writes `favoriteBarId` on a match;
  no match or an ambiguous one pushes `bartenderBotFavoriteBarNotFound` /
  `bartenderBotFavoriteBarAmbiguous` and re-asks via `startEditField`,
  the same re-ask shape the duplicate-name case already used.
- `getEditFieldPromptKey` routes the three new contact fields to prompts
  already in the file rather than minting near-duplicates: email/phone reuse
  `bartenderBotAskEmail`/`bartenderBotAskPhone` (the profile questionnaire's
  prompts), address reuses `bartenderBotAskLocationAddress`. Only favorite
  bar needed a new prompt, `bartenderBotAskFavoriteBar`.
- New i18n keys — `bartenderBotAskFavoriteBar`, `bartenderBotFavoriteBarNotFound`,
  `bartenderBotFavoriteBarAmbiguous` — in both `en.json` and `es.json`.

### Not covered (deferred)

- Clearing a favorite bar back to "none" through chat — only resolving the
  typed text to an existing location is supported; the Profile/Contacts
  screens are still how it gets unset.
- Editing a contact's nickname, or any location/group field beyond what
  Add already asks — the "editable set matches the info dump" rule only
  closed the gap the info dump itself exposed; it didn't grow the dump.

## Update (2026-10-06, same day): an edit shows the updated item before asking what's next

- Both completion paths — a single field write in `handleReturningSubmit`'s
  `'editFieldValue'` case, and `handleEditMembersDone`'s group-members
  write — called `showBotMessageThen('bartenderBotItemUpdated', () =>
  showEditFieldMenu())`, so the chat only ever confirmed "Updated!" and went
  straight to "what would you like to change?" with no way to see the result
  without backing out. New helper `finishFieldEdit(domain, itemId)` chains a
  third bubble in between: "Updated!" → the same `buildItemInfoText` dump
  `proceedToEditItem` shows when editing starts, now re-run against the
  just-written record so it reflects the change → `showEditFieldMenu`'s
  "what would you like to change?" prompt. Both call sites now call
  `finishFieldEdit` instead of building that chain inline.
- No new i18n keys — this reuses `bartenderBotItemUpdated`,
  `buildItemInfoText`'s existing field-label lines, and
  `bartenderBotEditFieldPrompt` verbatim, just in a new order.

## Update (2026-10-06, same day): the post-edit dump was reading the record before the edit

- Bug: the update above still showed the *pre-edit* value for whichever field
  was just changed. Not a timing issue in the "wait longer" sense — `updateContact`/
  `updateLocation`/`updateGroup` write to the zustand store synchronously, the
  moment they're called. The problem was `finishFieldEdit(domain, itemId)`
  re-deriving the display text via `buildItemInfoText`, which looks the record
  up in `contacts`/`locations`/`groups` — the arrays this render of
  `BartenderBotChat` closed over when it rendered, *before* the write. The
  store already had the new value; this component's own copy of it hadn't
  caught up yet and wouldn't until React re-rendered, which happens after the
  event handler that triggered the write has already finished running.
- Fix: `buildItemInfoText` split into `buildContactInfoText(contact)`,
  `buildLocationInfoText(location)`, `buildGroupInfoText(group)` — each takes
  the record directly instead of an id to look up. Every write site in
  `handleReturningSubmit`'s `'editFieldValue'` case and in
  `handleEditMembersDone` now builds its own `updated` object (the same one
  it passes to `updateContact`/`updateLocation`/`updateGroup`) and renders
  *that* object's text immediately, rather than asking the store/hooks for a
  copy that won't exist in this component until the next render.
  `finishFieldEdit` takes the already-built text string now, not a
  domain/id pair to re-derive it from.
- `buildItemInfoText(domain, itemId)` still exists, narrowed to a thin
  lookup-and-dispatch wrapper around the three builders above — correct for
  `proceedToEditItem`, which only ever displays an *unmodified* record picked
  from the current (accurate, nothing was just written) list, never one this
  same handler is simultaneously writing to.

## Update (2026-10-06, same day): picking a populated field previews its current value first

- `startEditField(domain, fieldId)` previously always re-asked the exact
  prompt Add uses for that field (`getEditFieldPromptKey`) — for email/phone
  that reads as "Would you like to add an email address?" even when editing
  a contact that already has one, which is backwards for an edit.
- New `getCurrentFieldValue(domain, fieldId)` reads whatever `editingItemId`
  currently holds for that field (resolving `favoriteBarId` to the bar's
  name, same as the info dump does) and returns `''` when it's blank/unset.
  `startEditField` now checks it first: if there's a current value, it shows
  `bartenderBotCurrentFieldValue` ("Here's what you have now: {{value}}")
  followed by `bartenderBotAskEditField` ("Would you like to change this?")
  instead of the Add-style prompt; a still-blank field (email, phone,
  address, favorite bar — the only ones that ever are, since first/last name
  and a location/group's name are required) falls back to the original
  single-prompt behavior unchanged.
- New i18n keys — `bartenderBotCurrentFieldValue`, `bartenderBotAskEditField`
  — in both `en.json` and `es.json`.

## Update (2026-10-06, same day): "Type Return to go back" on the field-change prompt

- `bartenderBotEditFieldPrompt` ("What would you like to change?") grew a
  second line in both locales — `\nType "Return" to go back.` — since the
  existing exit route (typing something that matches the "No thanks, that's
  all" row) wasn't discoverable without already knowing it existed.
  `showEditFieldMenu` is the one function that shows this prompt, on first
  entering the field menu and on every loop back after an edit, so the line
  appears every time the bot asks the question, not just once.
- `handleReturningSubmit`'s `'editFieldMenu'` case checks the typed value
  against the literal word "return" (trimmed, case-insensitive) before
  running it through `matchChatOption` — a match calls
  `applyEditFieldSelection(domain, 'done')` directly, the same exit
  `'editFieldMenuOptions'`'s "done" row already triggers. "Return" is a
  shortcut alongside the existing label matching, not a replacement for it.

## Update (2026-10-06, same day): editing favorite bar lists the account's bars first

- `startEditField` asked `bartenderBotAskFavoriteBar` ("Which bar is their
  favorite?") with no indication of what names it would actually recognize —
  the user has to already know a bar's exact name (or enough of a
  `startsWith` prefix) for `matchChatOption` to resolve it. It now also
  shows `bartenderBotFavoriteBarOptions` ("Your bars: {{names}}"), every
  `locationsStore.locations` name joined with `, `, right before that
  prompt — skipped entirely when there are no locations yet, same as the
  Add/List/Edit submenu's own empty-state skip elsewhere in this file.
- `startEditField` was rebuilt around a `messages: string[]` array instead of
  nested `showBotMessageThen` calls, assembled in order (current value, bar
  list, then the prompt) and played back through new helper
  `showBotMessagesThen(texts, after)` — recurses one bubble at a time with
  the usual typing pause between each, then calls `after` once the array is
  empty. The not-found/ambiguous favorite-bar re-ask already called
  `startEditField` again, so it picked up the bar listing for free — no
  separate change needed there.
- New i18n key `bartenderBotFavoriteBarOptions` in both `en.json` and
  `es.json`.

## Update (2026-10-06, same day): List shows one option per line

- `handleDomainMenuSelect`'s `'list'` action joined every item's label with
  `', '` into one run-on line (`bartenderBotListResult`). It now joins with
  `'\n'` instead, one name per line, and the key's English/Spanish copy
  grew a line break of its own — `"Here's what you've got:\n{{names}}"` —
  so the lead-in sentence and the first option don't end up sharing a line.

## Update (2026-10-06, same day): a way back to the main menu from Contacts/Groups/Locations

- `DOMAIN_ACTIONS` (the Add/Edit/List submenu) grew a fourth row, `'back'`
  (`bartenderBotBackToMainMenu`, the same "Back to main menu" label the
  empty-domain menu already used) — there was previously no way out of a
  domain's submenu except completing an Add/Edit/List action, which always
  looped back to that same submenu rather than up to the four-option main
  menu.
- `handleDomainMenuSelect` checks for `'back'` right after echoing the
  tapped label and before the `'add'`/empty-check/`'list'`/`'edit'` branches,
  and just calls `showMenu()` — the same function every other "return to the
  main menu" path already uses, which also clears `activeDomain`.
- No new i18n keys — `bartenderBotBackToMainMenu` already existed.


