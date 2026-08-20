---
paths:
  - "src/**/*.tsx"
---

# No Empty Props Interfaces

## Rule
- **Do not define a props interface when a component accepts no props**
- If a props interface would be empty (`interface IFooProps {}`), omit it entirely
- The component function signature should have no parameters instead of destructuring an empty object

## What Is Banned

```tsx
// BAD — empty interface that adds no value
interface IHomeScreenProps {}

export default function HomeScreen({}: IHomeScreenProps) {
```

## What Is Required

```tsx
// GOOD — no props interface, no parameter
export default function HomeScreen() {
```

## When to Add a Props Interface

Only define a props interface when the component actually receives at least one prop:

```tsx
// GOOD — interface has real props, so it should exist
interface IWorkoutCardProps {
  workout: IWorkout;
  onPress: () => void;
}

export default function WorkoutCard({ workout, onPress }: IWorkoutCardProps) {
```

## Refactoring

When adding the first prop to a previously prop-less component, create the interface at that point — not before it is needed.
