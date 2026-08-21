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

import { MOCK_LOCATIONS } from '../../data/locations';
import type {
  TColorTokens,
  TContact,
  TContactDraft,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import { Dropdown } from '../common/Dropdown';
import { formatContactDisplayName } from '../../utils/contactFormat';

type TContactDetailStyles = ReturnType<typeof createStyles>;

type TActionButtonVariant = 'primary' | 'secondary' | 'danger';

interface IContactDetailModalProps {
  contact: TContact | null;
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onSave: (contact: TContact) => void;
  onDelete: (contact: TContact) => void;
}

interface IInfoRowProps {
  label: string;
  value: string;
  styles: TContactDetailStyles;
}

interface IActionButtonProps {
  label: string;
  onPress: () => void;
  variant: TActionButtonVariant;
  styles: TContactDetailStyles;
}

function toDraft(contact: TContact): TContactDraft {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    nickname: contact.nickname ?? '',
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    favoriteBarId: contact.favoriteBarId,
  };
}

function favoriteBarName(favoriteBarId: string) {
  return (
    MOCK_LOCATIONS.find((location) => location.id === favoriteBarId)?.name ??
    favoriteBarId
  );
}

function actionButtonStyle(
  variant: TActionButtonVariant,
  styles: TContactDetailStyles,
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
  styles: TContactDetailStyles,
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

export function ContactDetailModal({
  contact,
  visible,
  colors,
  t,
  onClose,
  onSave,
  onDelete,
}: IContactDetailModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TContactDraft | null>(null);
  const [barDropdownOpen, setBarDropdownOpen] = useState(false);

  useEffect(() => {
    if (contact) {
      setDraft(toDraft(contact));
      setIsEditing(false);
      setBarDropdownOpen(false);
    }
  }, [contact]);

  if (!contact || !draft) {
    return null;
  }

  function updateField<K extends keyof TContactDraft>(
    key: K,
    value: TContactDraft[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleClose() {
    setIsEditing(false);
    setBarDropdownOpen(false);
    onClose();
  }

  function handleSave() {
    const nextContact: TContact = {
      ...contact!,
      firstName: draft!.firstName.trim(),
      lastName: draft!.lastName.trim(),
      nickname: draft!.nickname.trim() || undefined,
      email: draft!.email.trim(),
      phone: draft!.phone.trim(),
      address: draft!.address.trim(),
      favoriteBarId: draft!.favoriteBarId,
    };

    onSave(nextContact);
    setIsEditing(false);
    setBarDropdownOpen(false);
  }

  function handleDelete() {
    setIsEditing(false);
    setBarDropdownOpen(false);
    onDelete(contact!);
  }

  const fields: {
    key: keyof TContactDraft;
    label: TTranslationKey;
    multiline?: boolean;
  }[] = [
    { key: 'firstName', label: 'firstName' },
    { key: 'lastName', label: 'lastName' },
    { key: 'nickname', label: 'nickname' },
    { key: 'email', label: 'email' },
    { key: 'phone', label: 'phone' },
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
              {isEditing ? t('editContact') : formatContactDisplayName(contact)}
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
              <>
                {fields.map((field) => (
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
                ))}

                <Dropdown
                  label={t('favoriteBar')}
                  placeholder={t('chooseLocation')}
                  options={MOCK_LOCATIONS.map((location) => ({
                    value: location.id,
                    label: location.name,
                  }))}
                  value={draft.favoriteBarId}
                  open={barDropdownOpen}
                  onOpenChange={setBarDropdownOpen}
                  onChange={(value) => updateField('favoriteBarId', value)}
                  colors={colors}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label={t('firstName')}
                  value={contact.firstName}
                  styles={styles}
                />
                <InfoRow
                  label={t('lastName')}
                  value={contact.lastName}
                  styles={styles}
                />
                <InfoRow
                  label={t('nickname')}
                  value={contact.nickname ?? t('none')}
                  styles={styles}
                />
                <InfoRow
                  label={t('email')}
                  value={contact.email}
                  styles={styles}
                />
                <InfoRow
                  label={t('phone')}
                  value={contact.phone}
                  styles={styles}
                />
                <InfoRow
                  label={t('address')}
                  value={contact.address}
                  styles={styles}
                />
                <InfoRow
                  label={t('favoriteBar')}
                  value={favoriteBarName(contact.favoriteBarId)}
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
                    setDraft(toDraft(contact));
                    setIsEditing(false);
                    setBarDropdownOpen(false);
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
                  label={t('editContact')}
                  onPress={() => setIsEditing(true)}
                  variant="primary"
                  styles={styles}
                />
                <ActionButton
                  label={t('deleteContact')}
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
      paddingTop: 12,
      paddingBottom: 18,
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
