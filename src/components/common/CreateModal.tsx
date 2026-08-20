import { useMemo, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { TColorTokens } from '../../types/common.types';

interface ICreateModalProps {
  visible: boolean;
  title: string;
  closeLabel: string;
  cancelLabel: string;
  createLabel: string;
  canCreate: boolean;
  colors: TColorTokens;
  onClose: () => void;
  onCreate: () => void;
  children: ReactNode;
}

export function CreateModal({
  visible,
  title,
  closeLabel,
  cancelLabel,
  createLabel,
  canCreate,
  colors,
  onClose,
  onCreate,
  children,
}: ICreateModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
            >
              <Text style={styles.closeLabel}>{closeLabel}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Text style={styles.cancelActionLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!canCreate}
              onPress={onCreate}
              style={({ pressed }) => [
                styles.createButton,
                !canCreate
                  ? styles.actionButtonDisabled
                  : pressed && styles.actionButtonPressed,
              ]}
            >
              <Text style={styles.createActionLabel}>{createLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: TColorTokens) => {
  const actionButton = {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const actionLabel = {
    fontSize: 15,
    fontWeight: '700',
  } as const;

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.overlay,
    },
    sheet: {
      maxHeight: '85%',
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontWeight: '800',
      color: colors.accent,
    },
    closeLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
    body: {
      flexGrow: 0,
    },
    bodyContent: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
    },
    cancelButton: {
      ...actionButton,
      backgroundColor: colors.background,
    },
    createButton: {
      ...actionButton,
      backgroundColor: colors.accent,
    },
    actionButtonPressed: {
      opacity: 0.8,
    },
    actionButtonDisabled: {
      opacity: 0.45,
    },
    cancelActionLabel: {
      ...actionLabel,
      color: colors.text,
    },
    createActionLabel: {
      ...actionLabel,
      color: colors.onAccent,
    },
  });
};
