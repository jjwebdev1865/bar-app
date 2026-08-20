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
- Define styles at the bottom of the file using `StyleSheet.create()`
- Always name the styles object `styles`

## File Organization (within a component file)

1. Imports
2. Type definitions / interfaces
3. Helper functions
4. Component definition (`export default` for screens, named export for components)
5. `StyleSheet.create()` at the bottom

## Type Definitions

- Component props interfaces (e.g., `IHomeScreenProps`) stay in the component file — they are co-located with the component that uses them
- Shared types used across multiple files go in `src/types/common.types.ts`
- Other non-props types/interfaces that are specific to a page go in `src/types/` (e.g., `src/types/WorkoutHistoryScreen.types.ts`)
- Import shared types using `import type { ... }` from `src/types/common.types.ts`

## Formatting

- 2-space indentation
- Use single quotes for JS/TS imports, double quotes in JSX attributes
