---
paths:
  - "src/pages/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Accessibility

## Rule
- **Every interactive element must have accessibility attributes** — screen reader users must be able to understand and operate all controls

## Required Attributes by Element Type

### TouchableOpacity / Pressable (buttons)
- Must have `accessibilityRole="button"`
- Icon-only buttons must have `accessibilityLabel` describing the action (e.g., `"Go back"`, `"Delete workout"`)
- Buttons with visible text get their label from child `<Text>` automatically — only add `accessibilityLabel` if the visible text is unclear

### TextInput
- Must have `accessibilityLabel` describing what to enter (e.g., `"Minutes"`, `"Distance"`)
- Do not rely solely on `placeholder` — it disappears once the user types

### Switch
- Must have `accessibilityLabel` (e.g., `"Dark mode"`)

### Modal
- Inner content `View` should have `accessibilityViewIsModal={true}` so screen readers ignore background content

### Stat / Info Cards (display-only)
- Container `View` should have a composite `accessibilityLabel` that reads naturally (e.g., `"Total Workouts: 12"`)

### Progress Bars
- Use `accessibilityRole="progressbar"` on the bar container
- Include `accessibilityValue={{ min: 0, max: target, now: current }}` for numeric progress

### Segmented Toggles (category, unit selectors)
- Each option: `accessibilityRole="button"` with `accessibilityState={{ selected: boolean }}`

## Naming Conventions
- Labels should be concise and action-oriented: `"Go back"` not `"Back button"` or `"Press to go back"`
- For dynamic labels, use template literals: `` accessibilityLabel={`Delete ${type} workout`} ``
- Use sentence case: `"Open navigation menu"` not `"Open Navigation Menu"`
