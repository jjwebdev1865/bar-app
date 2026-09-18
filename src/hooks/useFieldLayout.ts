import { createContext, useContext } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export interface IFieldLayoutContextValue {
  /** Records a field's vertical offset within the scroll content. */
  registerFieldOffset: (name: string, y: number) => void;
}

/**
 * Provided by `FormScreen`, which owns the `ScrollView` the offsets are measured
 * against. Null outside one — form fields also render inside the detail modals,
 * which have no scroll container to report to.
 */
export const FieldLayoutContext =
  createContext<IFieldLayoutContextValue | null>(null);

/**
 * Lets a form field publish its position so an invalid submit can scroll to it.
 * Returns an `onLayout` handler, or `undefined` when there is no provider —
 * `onLayout={undefined}` is a no-op, so fields work unchanged outside a
 * `FormScreen`.
 *
 * **The `View` this is attached to must be a direct child of the scroll
 * content.** `onLayout` reports `y` relative to the immediate parent, so a field
 * wrapped in a grouping `View` would register its offset within that wrapper
 * rather than within the form, and the scroll would land in the wrong place.
 * Grouping fields would mean measuring with `measureLayout` against the content
 * container instead.
 */
export function useFieldLayout(name: string) {
  const context = useContext(FieldLayoutContext);

  if (!context) {
    return undefined;
  }

  const { registerFieldOffset } = context;

  return function handleLayout(event: LayoutChangeEvent) {
    registerFieldOffset(name, event.nativeEvent.layout.y);
  };
}
