# Initial Setup — Aligning bar-app with personal-fitness-app

Baseline comparison written 2026-08-20. The goal is to bring bar-app's structure
closer to `personal-fitness-app` (PFA), the reference project.

Both are Expo + TypeScript React Native apps and share the same top-level `src/`
idea, but bar-app is missing most of the scaffolding that makes PFA a finished
project.

## Side-by-side

| Concern | personal-fitness-app | bar-app |
|---|---|---|
| Routing | React Navigation + `App.tsx` switch | Expo Router `app/*` → `src/pages/*` |
| State | Zustand store (`src/store/progressStore.ts`) | React Context (`src/context/SettingsContext.tsx`) |
| Persistence | AsyncStorage + `asyncQueue`, `dataMigration`, 18 documented keys | **none** — all state is in-memory, lost on reload |
| Theme | `src/theme/colors.ts` (`IThemeColors`) + `useThemeColors()` hook | `src/theme/theme.ts` + `useSettings().colors` (equivalent, fine) |
| `src/types/` | 7 files, shared + per-screen | **absent** — types inline in pages |
| `src/utils/` | 21 modules, each with a test | **absent** |
| `src/hooks/` | present | **absent** |
| Tests | ~90 test files colocated with source | **0 test files**, no jest, no `test` script |
| Lint | `eslint.config.js` + `eslint-config-expo` | **absent** |
| CI | `.github/workflows/ci.yml` (tsc + jest) | **absent** |
| Error handling | `ErrorBoundary.tsx`, `errorReporter.ts`, `react-error-boundary` | **absent** |
| Screens | 9 dirs, each `XScreen.tsx` + `X.test.tsx` + `EXPLANATION.md` | 5 dirs, `X.tsx` only |
| Components | 9 feature dirs + `common/` + `Panels/`, barrel at `src/components/index.ts` | 3 feature dirs + `common/`, no root barrel |
| Release infra | `eas.json`, `android/`, versioned `package.json` (2.3.4), `/bump`, `GOOGLE_PLAY_DEPLOY.md`, `versionCheck.ts` | none, version stuck at 1.0.0 |
| Claude config | 10 rules, 10 commands, 5 skills, pre-commit hook, agent | `settings.json` (1 plugin) + one-line `AGENTS.md` |
| Docs | `CLAUDE.md`, `STORAGE.md`, `ZUSTAND_STORE.md`, `howTos/`, `src/features/` | `CLAUDE.md`, `V1_goals.md` |

## Where bar-app violates PFA's own written rules

Audited against the nine rules in `personal-fitness-app/.claude/rules/`:

- [x] **`safe-area-wrapper.md`** — ~~zero `SafeAreaView` usages in bar-app~~
  Fixed 2026-08-20, see step 4.
- [ ] **`code-style.md` naming** — no `T`/`I`/`E` prefixes: `type Contact`,
  `type Group`, `type DropdownProps`, `type ColorTokens`. Only
  `EThemeModeOptions` complies. Screen files are `Home.tsx`, not
  `HomeScreen.tsx`.
- [ ] **Type location** — `Contact` is declared three separate times
  (`src/data/contacts.ts`, `src/data/groups.ts`,
  `src/pages/MyContacts/MyContacts.tsx`); `Group` and `BarLocation` twice each.
  These belong in `src/types/`.
- [ ] **`testing.md`** — nothing to comply with; no test infrastructure exists.
- [ ] **Component decomposition** — `src/pages/Home/Home.tsx` is 526 lines and
  `_MyContacts/ContactDetailModal.tsx` is 438; PFA's equivalent screens delegate
  to panel/card components.
- [ ] **Folder naming** — `_MyContacts` / `_MyGroups` / `_MyLocations` use an
  underscore prefix PFA doesn't; PFA matches the component dir to the page name
  (`Home/`, `Settings/`).

Also non-compliant, and worse than a first pass suggested:

- [ ] **`no-inline-styles.md`** — the banned `style={{ ... }}` brace form appears
  only once, but the equally-banned array form
  `style={[styles.x, { color: colors.text }]}` appears **94 times** across
  `src/` and `app/`. The rule explicitly bans this
  (`<View style={[styles.container, { marginTop: 10 }]}>` is listed under "What
  Is Banned"). Fixing it means adopting PFA's `createStyles(colors)` pattern —
  a large mechanical refactor touching nearly every component.
- [ ] **`theme-colors.md`** — two hardcoded hexes outside `theme.ts`: the same
  `#8B1E1E` in `src/pages/Home/Home.tsx:301` and
  `src/components/_MyContacts/ContactDetailModal.tsx:321`. Add a semantic token
  (e.g. `danger`) to both palettes in `theme.ts` and reference it.

Genuinely already compliant: no `any` anywhere, no `rgba()` outside `theme.ts`,
and accessibility props are present (20 across 22 interactive elements) — the
a11y rule is close to satisfied.

## Order of work

### 1. Test + CI foundation
Biggest gap.

- [ ] Add `jest`, `jest-expo`, `@testing-library/react-native` as devDeps
- [ ] Add `jest.config.js` and `jest.setup.js`
- [ ] Add `test` / `test:watch` / `test:coverage` scripts to `package.json`
- [ ] Copy `.github/workflows/ci.yml` (tsc `--noEmit` + jest)
- [ ] Add `eslint` + `eslint-config-expo` and `eslint.config.js`
- [ ] Add `"types": ["jest"]` to `tsconfig.json`

### 2. Persistence

- [ ] Add `@react-native-async-storage/async-storage`
- [ ] Make `SettingsContext` theme mode survive restart
- [ ] Make `SettingsContext` language survive restart
- [ ] Document storage keys (PFA does this in `CLAUDE.md` / `STORAGE.md`)

### 3. Extract `src/types/`

- [ ] Create `src/types/common.types.ts`
- [ ] Dedupe `Contact` (currently in 3 files) into one shared type
- [ ] Dedupe `Group` and `BarLocation` (2 files each)
- [ ] Add per-page type files for page-specific non-props types
- [ ] Apply `T` / `I` / `E` prefixes across the codebase

### 4. SafeAreaView on all screens — done 2026-08-20

- [x] `SafeAreaProvider` added at the root in `src/navigation/AppLayout.tsx`
      (wraps `SettingsProvider`, inside `GestureHandlerRootView`)
- [x] `src/pages/Home/Home.tsx`
- [x] `src/pages/MyContacts/MyContacts.tsx`
- [x] `src/pages/MyGroups/MyGroups.tsx`
- [x] `src/pages/MyLocations/MyLocations.tsx`
- [x] `src/pages/Settings/Settings.tsx`

**Deviation from the rule, and why.** PFA's `safe-area-wrapper.md` says to use
`SafeAreaView` with default (all) edges, which is correct there because PFA's
`App.tsx` nav switch renders no headers. bar-app's drawer *does* render headers,
and a react-navigation header already consumes the top inset — applying it again
in the screen double-pads the top and leaves a visible gap under the header.

So edges are assigned per screen based on its header config:

- **Home** — `headerTransparent: true` + `headerTitle: ''`, so content renders
  *behind* the header and the screen must apply the top inset itself. Uses
  default all-edges.
- **Contacts / Groups / Locations / Settings** — normal opaque drawer header, so
  they use `edges={HEADER_SCREEN_EDGES}` (`['left', 'right', 'bottom']`).

`HEADER_SCREEN_EDGES` lives in `src/constants/safeAreaEdges.ts` with the
rationale in a doc comment, so the reasoning isn't duplicated across four files.
If a screen's `headerTransparent` setting ever changes, its edges must change to
match.

Verified with `npx tsc --noEmit` (exit 0). Not yet verified visually on a
device — worth a look on a notched phone and on Android gesture-nav.

### 5. `src/utils/` + `src/hooks/`
Pull logic out of pages into tested modules — this is what makes tests cheap to
write.

- [ ] Extract elapsed-time / signal-timer logic from `Home.tsx` into `src/utils/`
- [ ] Extract date/formatting helpers into `src/utils/`
- [ ] Add `src/hooks/` for reusable hooks
- [ ] Write colocated tests for each new util

### 6. Decompose large files

- [ ] Break up `src/pages/Home/Home.tsx` (526 lines)
- [ ] Break up `src/components/_MyContacts/ContactDetailModal.tsx` (438 lines)
- [ ] Add root barrel `src/components/index.ts`
- [ ] Rename `_MyContacts` → `Contacts`, `_MyGroups` → `Groups`,
      `_MyLocations` → `Locations`

### 7. Error handling

- [ ] Add `ErrorBoundary` component
- [ ] Mount it at the router root (`app/_layout.tsx`)
- [ ] Add an `errorReporter` util

### 8. Port `.claude/rules/`

`.claude/rules/*.md` is auto-loaded by Claude Code — no `settings.json` wiring
needed. Rules without `paths:` frontmatter load at launch; rules with `paths:`
load on demand when a matching file is read. The nine PFA rules split into three
tiers.

**Tier 1 — shared via symlink (done 2026-08-20).** Generic React Native + TS
conventions with nothing project-specific in them. Single source of truth at
`~/claude-rules/react-native/`, symlinked into both repos as
`.claude/rules/shared`:

```bash
ln -s /Users/jamesjiracek/claude-rules/react-native .claude/rules/shared
```

- [x] `code-style.md`
- [x] `no-inline-styles.md`
- [x] `no-empty-props.md`
- [x] `safe-area-wrapper.md`
- [x] `accessibility.md`

Edit these once in `~/claude-rules/react-native/` and both apps pick up the
change. Deliberately *not* placed in `~/.claude/rules/`, which would apply
`safe-area-wrapper.md` to every project on the machine including `jims-site`.

**Tier 2 — copy and adapt.** These encode PFA-specific architecture and would be
wrong in bar-app verbatim:

- [ ] `state-management.md` — rewrite for Context, not Zustand; drop
      `src/store/**` from its `paths`
- [ ] `theme-colors.md` — rewrite for `useSettings().colors` +
      `src/theme/theme.ts` (bar-app) instead of `useThemeColors()` +
      `src/theme/colors.ts` (PFA)
- [ ] `project-structure.md` — rewrite for Expo Router (`app/` → `src/pages/`)
      instead of PFA's `App.tsx` nav switch
- [ ] `testing.md` — port, and fix the scope: it's currently
      `paths: __tests__/**/*.{ts,tsx}`, but neither project has a `__tests__/`
      directory, so the rule never fires. Change to
      `src/**/*.test.{ts,tsx}` — **and fix it in PFA too**

**Tier 3 — skip for now.**

- [ ] `keep-explanations-updated.md` — a no-op in bar-app; there are no
      `EXPLANATION.md` files, and the rule itself says not to create them
      automatically. Revisit in step 9.

### 9. Release infra
Deferred until there's a backend and something worth shipping.

- [ ] `eas.json` + build profiles
- [ ] Version bump workflow (`/bump` equivalent)
- [ ] Per-screen `EXPLANATION.md` files
- [ ] Store submission docs

## Deliberately not changing

- **Keep Expo Router** (`app/` → `src/pages/`) rather than regressing to PFA's
  `App.tsx` switch — it's the newer pattern and the delegation layer already
  gives the page separation PFA gets from its structure.
- **Keep Context for settings** unless bar-app grows real domain state. Zustand
  earns its place in PFA because there's a lot of state; here there isn't yet.

## Caveat when copying PFA docs

`personal-fitness-app/.claude/rules/project-structure.md` and its `CLAUDE.md`
both say tests live in `__tests__/` mirroring `src/`, but PFA actually colocates
them (`src/utils/dateUtils.test.ts`) and has no `__tests__/` directory. That
rule is stale — do not carry it over. Colocate tests next to source.
