import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import type { TColorTokens } from '../../types';

interface IChatComposerProps {
  fieldLabel: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  value: string;
  onChangeText: (value: string) => void;
  isSubmitDisabled: boolean;
  onSkip: () => void;
  onSubmit: () => void;
  skipLabel: string;
  submitLabel: string;
  colors: TColorTokens;
}

/** Bottom-docked input + Skip/Submit row for the welcome questionnaire's current step. */
export function ChatComposer({
  fieldLabel,
  keyboardType,
  autoCapitalize,
  value,
  onChangeText,
  isSubmitDisabled,
  onSkip,
  onSubmit,
  skipLabel,
  submitLabel,
  colors,
}: IChatComposerProps) {
  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <TextInput
          accessibilityLabel={fieldLabel}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={fieldLabel}
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
          value={value}
        />
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onSkip}
            style={({ pressed }) => [
              styles.secondaryButton,
              styles.rowButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonLabel}>{skipLabel}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitDisabled }}
            disabled={isSubmitDisabled}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.rowButton,
              isSubmitDisabled && styles.primaryButtonDisabled,
              pressed && !isSubmitDisabled && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>{submitLabel}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
    },
    textInput: {
      minHeight: 44,
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 12,
      gap: 12,
    },
    rowButton: {
      flex: 1,
      minWidth: 0,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.accent,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.accentMuted,
      opacity: 0.6,
    },
    primaryButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    secondaryButtonLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    pressed: {
      opacity: 0.8,
    },
  });
