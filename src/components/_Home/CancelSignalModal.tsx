import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TColorTokens, TTranslate } from '../../types/common.types';

interface ICancelSignalModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  colors: TColorTokens;
  t: TTranslate;
}

export const CancelSignalModal = ({
  visible,
  onDismiss,
  onConfirm,
  colors,
  t,
}: ICancelSignalModalProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalBackdrop}>
        <View accessibilityViewIsModal style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{t('cancelSignalTitle')}</Text>
          <Text style={styles.modalMessage}>{t('cancelSignalMessage')}</Text>

          <View style={styles.modalActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.modalKeepButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Text style={styles.modalKeepLabel}>{t('keepSignal')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalStopButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Text style={styles.modalStopLabel}>{t('stopSignal')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: TColorTokens) => {
  const modalButton = {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const modalButtonLabel = {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  } as const;

  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.overlay,
    },
    modalSheet: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 10,
      color: colors.accent,
    },
    modalMessage: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    modalKeepButton: {
      ...modalButton,
      backgroundColor: colors.background,
    },
    modalStopButton: {
      ...modalButton,
      backgroundColor: colors.danger,
    },
    modalButtonPressed: {
      opacity: 0.8,
    },
    modalKeepLabel: {
      ...modalButtonLabel,
      color: colors.text,
    },
    modalStopLabel: {
      ...modalButtonLabel,
      color: colors.white,
    },
  });
};
