# Code Style

## TypeScript

- Strict TypeScript — never use `any`. Define proper types/interfaces.
- Use `type` imports where possible: `import type { Workout } from '...'`

## Naming Conventions

- Components: PascalCase (`HomeScreen`, `WorkoutScreen`)
- Types: prefix with `T` + PascalCase (`TWorkoutType`, `TDistanceUnit`)
- Interfaces: prefix with `I` + PascalCase (`IWorkout`, `IHomeScreenProps`)
- Enums: prefix with `E` + PascalCase (`EWorkoutCategory`, `EDistanceUnit`)
- Functions & variables: camelCase (`formatTime`, `totalWorkouts`)
- Constants: UPPER_SNAKE_CASE (`STORAGE_KEY`)
- Component files: PascalCase.tsx (`WorkoutScreen.tsx`)
- Utility/store files: camelCase.ts (`workoutStorage.ts`)

## Component Patterns

- Functional components with hooks only — no class components
- Screen components in `src/pages/` use `export default` — this is what `App.tsx` imports
- Components in `src/components/` use named exports (`export const Foo = ...` or `export function Foo() {}`) — this lets barrel files (`index.ts`) re-export them with `export * from './Foo'`
- Always extract component props into a named `interface` (e.g., `interface ISettingsScreenProps`) — never inline props in the function signature
- Define styles at the bottom of the file as a `createStyles(colors)` factory returning `StyleSheet.create({...})`, and call it through `useMemo` so the sheet is rebuilt only when the theme flips:

```tsx
const styles = useMemo(() => createStyles(colors), [colors]);
// ...
const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({ headerBar: { backgroundColor: colors.background } });
```

- Always name the in-component object `styles` and the factory `createStyles`
- A module-scope `const styles = StyleSheet.create(...)` is allowed only where the component genuinely cannot follow the theme — it renders above the theme provider, or it uses no colors at all. Every other styled file takes `colors`, because a static sheet cannot follow the theme.

## File Organization (within a component file)

1. Imports
2. Type definitions / interfaces
3. Helper functions
4. Component definition (`export default` for screens, named export for components)
5. `createStyles(colors)` at the bottom

## Type Definitions

- Component props interfaces (e.g., `IHomeScreenProps`) stay in the component file — they are co-located with the component that uses them
- Shared types used across multiple files go in `src/types/common.types.ts`
- Import types through the `src/types` barrel (`src/types/index.ts`), not by reaching past it to a specific `*.types.ts` file
- `src/types/` is **type-only** — a runtime value (enum, literal, helper function) belongs in `src/constants/`, never beside the types
- Other non-props types/interfaces that are specific to a page go in `src/types/` with a camelCase filename (e.g., `src/types/workoutHistory.types.ts`)
- Import shared types using `import type { ... }` from the `src/types` barrel

## Formatting

- 2-space indentation
- Use single quotes for JS/TS imports, double quotes in JSX attributes
