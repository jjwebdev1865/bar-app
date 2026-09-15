import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useContactsStore } from '../../stores/contactsStore';
import type {
  TBarLocation,
  TColorTokens,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import {
  countFavoriteContacts,
  formatFavoriteOfLabel,
} from '../../utils/locationFormat';

type TLocationDetailStyles = ReturnType<typeof createStyles>;

type TActionButtonVariant = 'primary' | 'secondary' | 'danger';

type TLocationDraft = {
  name: string;
  address: string;
};

interface ILocationDetailModalProps {
  location: TBarLocation | null;
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onSave: (location: TBarLocation) => void;
  onDelete: (location: TBarLocation) => void;
}

interface IInfoRowProps {
  label: string;
  value: string;
  styles: TLocationDetailStyles;
}

interface IActionButtonProps {
  label: string;
  onPress: () => void;
  variant: TActionButtonVariant;
  styles: TLocationDetailStyles;
}

function toDraft(location: TBarLocation): TLocationDraft {
  return {
    name: location.name,
    address: location.address,
  };
}

function formatCoordinates(location: TBarLocation) {
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

function actionButtonStyle(
  variant: TActionButtonVariant,
  styles: TLocationDetailStyles,
) {
  if (variant === 'primary') {
    return styles.primaryActionButton;
  }

  if (variant === 'danger') {
    return styles.dangerActionButton;
  }

  return styles.secondaryActionButton;
}

function actionLabelStyle(
  variant: TActionButtonVariant,
  styles: TLocationDetailStyles,
) {
  if (variant === 'primary') {
    return styles.primaryActionLabel;
  }

  if (variant === 'danger') {
    return styles.dangerActionLabel;
  }

  return styles.secondaryActionLabel;
}

function InfoRow({ label, value, styles }: IInfoRowProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.infoRow}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress, variant, styles }: IActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        actionButtonStyle(variant, styles),
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text style={actionLabelStyle(variant, styles)}>{label}</Text>
    </Pressable>
  );
}

export function LocationDetailModal({
  location,
  visible,
  colors,
  t,
  onClose,
  onSave,
  onDelete,
}: ILocationDetailModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const contacts = useContactsStore((state) => state.contacts);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TLocationDraft | null>(null);

  useEffect(() => {
    if (location) {
      setDraft(toDraft(location));
      setIsEditing(false);
    }
  }, [location]);

  if (!location || !draft) {
    return null;
  }

  const favoriteCount = countFavoriteContacts(location, contacts);

  function updateField<K extends keyof TLocationDraft>(
    key: K,
    value: TLocationDraft[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  function handleSave() {
    const name = draft!.name.trim();
    const address = draft!.address.trim();

    if (!name || !address) {
      return;
    }

    // Coordinates are not editable here — the create flow assigns them, so an
    // edit carries the existing pair through untouched.
    onSave({ ...location!, name, address });
    setIsEditing(false);
  }

  function handleDelete() {
    setIsEditing(false);
    onDelete(location!);
  }

  const fields: {
    key: keyof TLocationDraft;
    label: TTranslationKey;
    multiline?: boolean;
  }[] = [
    { key: 'name', label: 'locationName' },
    { key: 'address', label: 'address', multiline: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {isEditing ? t('editLocation') : location.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeLabel}>{t('close')}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              fields.map((field) => (
                <View key={field.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{t(field.label)}</Text>
                  <TextInput
                    accessibilityLabel={t(field.label)}
                    value={draft[field.key]}
                    onChangeText={(value) => updateField(field.key, value)}
                    multiline={field.multiline}
                    style={
                      field.multiline ? styles.multilineInput : styles.input
                    }
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              ))
            ) : (
              <>
                <InfoRow
                  label={t('locationName')}
                  value={location.name}
                  styles={styles}
                />
                <InfoRow
                  label={t('address')}
                  value={location.address}
                  styles={styles}
                />
                <InfoRow
                  label={t('coordinates')}
                  value={formatCoordinates(location)}
                  styles={styles}
                />
                <InfoRow
                  label={t('favoriteBar')}
                  value={formatFavoriteOfLabel(favoriteCount, t)}
                  styles={styles}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {isEditing ? (
              <>
                <ActionButton
                  label={t('cancel')}
                  onPress={() => {
                    setDraft(toDraft(location));
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  styles={styles}
                />
                <ActionButton
                  label={t('save')}
                  onPress={handleSave}
                  variant="primary"
                  styles={styles}
                />
              </>
            ) : (
              <>
                <ActionButton
                  label={t('editLocation')}
                  onPress={() => setIsEditing(true)}
                  variant="primary"
                  styles={styles}
                />
                <ActionButton
                  label={t('deleteLocation')}
                  onPress={handleDelete}
                  variant="danger"
                  styles={styles}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
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
      alignItems: 'flex-start',
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
    closeButton: {
      paddingVertical: 4,
      paddingHorizontal: 4,
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
    infoRow: {
      gap: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    primaryActionButton: {
      ...actionButton,
      backgroundColor: colors.accent,
    },
    secondaryActionButton: {
      ...actionButton,
      backgroundColor: colors.background,
    },
    dangerActionButton: {
      ...actionButton,
      backgroundColor: colors.danger,
    },
    actionButtonPressed: {
      opacity: 0.8,
    },
    primaryActionLabel: {
      ...actionLabel,
      color: colors.onAccent,
    },
    secondaryActionLabel: {
      ...actionLabel,
      color: colors.text,
    },
    dangerActionLabel: {
      ...actionLabel,
      color: colors.white,
    },
  });
};
