import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TColorTokens } from '../../types/common.types';

export type TDropdownOption = {
  value: string;
  label: string;
};

interface IDropdownProps {
  label: string;
  placeholder: string;
  options: TDropdownOption[];
  value: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  colors: TColorTokens;
}

export function Dropdown({
  label,
  placeholder,
  options,
  value,
  open,
  onOpenChange,
  onChange,
  colors,
}: IDropdownProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => onOpenChange(!open)}
        style={styles.trigger}
      >
        <Text
          style={value ? styles.valueSelected : styles.valuePlaceholder}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.menu}>
          {options.map((option, index) => {
            const selected = option.value === value;
            const isLast = index === options.length - 1;

            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                style={[styles.option, !isLast && styles.optionDivider]}
              >
                <Text
                  style={
                    selected
                      ? styles.optionLabelSelected
                      : styles.optionLabelDefault
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 8,
      color: colors.accent,
    },
    trigger: {
      minHeight: 48,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    valueSelected: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 12,
      color: colors.text,
    },
    valuePlaceholder: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 12,
      color: colors.textMuted,
    },
    chevron: {
      fontSize: 16,
      color: colors.accentMuted,
    },
    menu: {
      marginTop: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    option: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    optionDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionLabelSelected: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '700',
    },
    optionLabelDefault: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
  });
