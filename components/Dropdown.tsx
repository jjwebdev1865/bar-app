import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ColorTokens } from '../constants/theme';

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  colors: ColorTokens;
};

export function Dropdown({
  label,
  placeholder,
  options,
  value,
  open,
  onOpenChange,
  onChange,
  colors,
}: DropdownProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.accent }]}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => onOpenChange(!open)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.panel,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.value,
            { color: value ? colors.text : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Text style={[styles.chevron, { color: colors.accentMuted }]}>
          {open ? '▴' : '▾'}
        </Text>
      </Pressable>

      {open ? (
        <View
          style={[
            styles.menu,
            {
              backgroundColor: colors.panel,
              borderColor: colors.border,
            },
          ]}
        >
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
                style={[
                  styles.option,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: selected ? colors.accent : colors.text,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
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

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  trigger: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  chevron: {
    fontSize: 16,
  },
  menu: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 16,
  },
});
