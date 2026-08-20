---
paths:
  - "src/pages/**/*.tsx"
---

# SafeAreaView Wrapper

## Rule
- **Every screen component in `src/pages/` must use `SafeAreaView` from `react-native-safe-area-context` as its outermost wrapper** — this ensures content is never obscured by the device notch, status bar, or home indicator

## What Is Banned

```tsx
// BAD — plain View as outermost wrapper (no safe area insets applied)
export default function MyScreen() {
  return (
    <View style={styles.container}>
      ...
    </View>
  );
}

// BAD — ScrollView as outermost wrapper
export default function MyScreen() {
  return (
    <ScrollView style={styles.container}>
      ...
    </ScrollView>
  );
}

// BAD — Fragment as outermost wrapper
export default function MyScreen() {
  return (
    <>
      ...
    </>
  );
}

// BAD — SafeAreaView from react-native (limited platform support)
import { SafeAreaView } from "react-native";
```

## What Is Required

```tsx
// GOOD — SafeAreaView from react-native-safe-area-context as outermost wrapper
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      ...
    </SafeAreaView>
  );
}
```

## Style Requirements

- The `SafeAreaView` wrapper must have `flex: 1` and `backgroundColor: colors.background` so the theme color fills behind the status bar
- Use the screen's existing `container` style if it already has these properties, or add a dedicated `safeArea` style

## Important Distinction

- `SafeAreaProvider` (in `App.tsx`) only **provides** inset values via React context — it does not apply any padding
- `SafeAreaView` (in each screen) **consumes** those values and applies them as padding — this is the component that actually prevents content from rendering behind the notch
- Both are required: the provider at the root, and the view in each screen
