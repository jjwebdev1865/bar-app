import { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import {
  useController,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';

import type {
  TColorTokens,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import { translateFieldError } from '../../validation/messages';

interface IFormTextFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  /** Constrained to string-valued paths so `field.value` types as a string. */
  name: FieldPathByValue<TValues, string>;
  label: TTranslationKey;
  colors: TColorTokens;
  t: TTranslate;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /**
   * Rewrites each keystroke before it reaches the form, e.g. a phone mask. The
   * masked text becomes the stored value, so the schema validates exactly what
   * the user sees.
   */
  format?: (value: string) => string;
  maxLength?: number;
}

/**
 * React Hook Form's `register()` leans on DOM refs, so React Native inputs bind
 * through `useController` instead: `onChangeText` drives the field and `onBlur`
 * is what makes `mode: 'onTouched'` behave.
 */
export function FormTextField<TValues extends FieldValues>({
  control,
  name,
  label,
  colors,
  t,
  multiline,
  keyboardType,
  autoCapitalize,
  format,
  maxLength,
}: IFormTextFieldProps<TValues>) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { field, fieldState } = useController({ control, name });

  const fieldLabel = t(label);
  const error = translateFieldError(t, fieldState.error?.message);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{fieldLabel}</Text>
      <TextInput
        // Screen readers announce the failure alongside the field rather than
        // relying on the error text below being reached separately.
        accessibilityLabel={error ? `${fieldLabel}, ${error}` : fieldLabel}
        value={field.value}
        onChangeText={(text) => field.onChange(format ? format(text) : text)}
        onBlur={field.onBlur}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        placeholderTextColor={colors.textMuted}
        style={[
          multiline ? styles.multilineInput : styles.input,
          Boolean(error) && styles.inputInvalid,
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: TColorTokens) => {
  const input = {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.border,
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
    input,
    multilineInput: {
      ...input,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    inputInvalid: {
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.danger,
    },
  });
};
