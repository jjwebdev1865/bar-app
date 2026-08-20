---
paths:
  - "src/**/*.tsx"
---

# No Inline Styles

## Rule
- **Never use inline styles** — no `style={{ ... }}` object literals directly in JSX
- **Every style must be defined in `StyleSheet.create()`** at the bottom of the file
- **Each style must have a unique, descriptive key** — no generic names like `container2` or `text3`

## What Is Banned

```tsx
// BAD — inline style object
<View style={{ flex: 1, padding: 16 }}>

// BAD — mixed inline + stylesheet
<View style={[styles.container, { marginTop: 10 }]}>

// BAD — inline conditional style
<Text style={isActive ? { color: 'green' } : { color: 'gray' }}>
```

## What Is Required

```tsx
// GOOD — all styles from the stylesheet
<View style={styles.mainContainer}>

// GOOD — combining stylesheet styles
<View style={[styles.container, styles.withTopMargin]}>

// GOOD — conditional with stylesheet styles only
<Text style={isActive ? styles.activeText : styles.inactiveText}>
```

## Style Key Naming

- Use camelCase keys that describe the element and its purpose
- Be specific: `workoutCardTitle` not `title`, `headerBackButton` not `button`
- For variants, use a clear suffix: `textActive` / `textInactive`, `cardSelected` / `cardDefault`
- No numbered suffixes (`container1`, `text2`) — use descriptive names instead

## Dynamic Styles

When a style depends on a runtime value (e.g., dynamic color or width), extract it into a helper function that returns a `StyleSheet`-compatible object:

```tsx
// GOOD — helper function for dynamic values
const getDynamicBarStyle = (percentage: number) => ({
  width: `${percentage}%`,
});

// Usage in JSX
<View style={[styles.progressBar, getDynamicBarStyle(progress)]} />
```

This is the **only** acceptable exception to the no-inline-styles rule.
