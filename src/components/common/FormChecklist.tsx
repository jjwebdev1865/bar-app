import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useController,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';

import { useFieldLayout } from '../../hooks/useFieldLayout';
import type {
  TColorTokens,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import { translateFieldError } from '../../validation/messages';
import type { TDropdownOption } from './Dropdown';

interface IFormChecklistProps<TValues extends FieldValues> {
  control: Control<TValues>;
  /** Constrained to string-array paths so `field.value` types as `string[]`. */
  name: FieldPathByValue<TValues, string[]>;
  label: TTranslationKey;
  options: TDropdownOption[];
  colors: TColorTokens;
  t: TTranslate;
}

/**
 * A multi-select list bound to a form field — the array counterpart to
 * `FormDropdown`, for a value like a group's member ids.
 *
 * The rows are laid out inline rather than in their own scroll region: this
 * renders inside `FormScreen`'s `ScrollView`, and a nested scroller would trap
 * the gesture and hide the tail of the list behind a fixed height.
 */
export function FormChecklist<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  colors,
  t,
}: IFormChecklistProps<TValues>) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { field, fieldState } = useController({ control, name });
  // Unlike `FormDropdown`, this registers its offset — a checklist is usually
  // required (`contactIds` is `min(1)`), so it really can be the first error.
  // Only reports inside a `FormScreen`; `undefined` elsewhere.
  const handleLayout = useFieldLayout(name);

  const error = translateFieldError(t, fieldState.error?.message);

  function toggleOption(value: string) {
    const selected: string[] = field.value;

    field.onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  return (
    <View onLayout={handleLayout} style={styles.field}>
      <Text style={styles.fieldLabel}>{t(label)}</Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <View style={styles.options}>
        {options.map((option) => {
          const checked = field.value.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() => toggleOption(option.value)}
              style={styles.optionRow}
            >
              <Text style={styles.optionLabel} numberOfLines={1}>
                {option.label}
              </Text>
              <View
                style={checked ? styles.checkboxChecked : styles.checkboxDefault}
              >
                {checked ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: TColorTokens) => {
  const checkbox = {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return StyleSheet.create({
    field: {
      gap: 6,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.danger,
    },
    options: {
      gap: 8,
    },
    optionRow: {
      minHeight: 48,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    optionLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    checkboxChecked: {
      ...checkbox,
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    checkboxDefault: {
      ...checkbox,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    checkmark: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.onAccent,
    },
  });
};
