import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { Dropdown, type TDropdownOption } from './Dropdown';

interface IFormDropdownProps<TValues extends FieldValues> {
  control: Control<TValues>;
  /** Constrained to string-valued paths so `field.value` types as a string. */
  name: FieldPathByValue<TValues, string>;
  label: TTranslationKey;
  placeholder: TTranslationKey;
  options: TDropdownOption[];
  colors: TColorTokens;
  t: TTranslate;
}

/**
 * `Dropdown` bound to a form field. The open/closed flag stays local because it
 * is pure UI state — callers render this behind a conditional (edit mode, a
 * wizard step) that unmounts it, which is what collapses the menu on close.
 */
export function FormDropdown<TValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  colors,
  t,
}: IFormDropdownProps<TValues>) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { field, fieldState } = useController({ control, name });
  const [open, setOpen] = useState(false);

  const error = translateFieldError(t, fieldState.error?.message);

  return (
    <View style={styles.wrapper}>
      <Dropdown
        label={t(label)}
        placeholder={t(placeholder)}
        options={options}
        value={field.value}
        open={open}
        onOpenChange={setOpen}
        onChange={field.onChange}
        colors={colors}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    wrapper: {
      gap: 6,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.danger,
    },
  });
