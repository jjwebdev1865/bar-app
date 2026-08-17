import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Dropdown } from './Dropdown';
import type { TranslationKey } from '../constants/i18n';
import type { ColorTokens } from '../constants/theme';
import type { Contact } from '../src/data/contacts';
import { mockLocations } from '../src/data/locations';

type ContactDetailModalProps = {
  contact: Contact | null;
  visible: boolean;
  colors: ColorTokens;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

type ContactDraft = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  address: string;
  favoriteBarId: string;
};

function toDraft(contact: Contact): ContactDraft {
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

function displayName(contact: Pick<Contact, 'firstName' | 'lastName' | 'nickname'>) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

function favoriteBarName(favoriteBarId: string) {
  return (
    mockLocations.find((location) => location.id === favoriteBarId)?.name ??
    favoriteBarId
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
}: ContactDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ContactDraft | null>(null);
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

  function updateField<K extends keyof ContactDraft>(
    key: K,
    value: ContactDraft[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleClose() {
    setIsEditing(false);
    setBarDropdownOpen(false);
    onClose();
  }

  function handleSave() {
    const nextContact: Contact = {
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
    // TODO: Persist contact deletion once contact storage is wired up
    console.log('Delete contact requested', contact);
    onDelete(contact!);
  }

  const fields: {
    key: keyof ContactDraft;
    label: TranslationKey;
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
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.panel, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.accent }]} numberOfLines={2}>
              {isEditing ? t('editContact') : displayName(contact)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Text style={[styles.closeLabel, { color: colors.textMuted }]}>
                {t('close')}
              </Text>
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
                    <Text style={[styles.fieldLabel, { color: colors.accentMuted }]}>
                      {t(field.label)}
                    </Text>
                    <TextInput
                      value={draft[field.key]}
                      onChangeText={(value) => updateField(field.key, value)}
                      multiline={field.multiline}
                      style={[
                        styles.input,
                        field.multiline && styles.multilineInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                ))}

                <Dropdown
                  label={t('favoriteBar')}
                  placeholder={t('chooseLocation')}
                  options={mockLocations.map((location) => ({
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
                  colors={colors}
                />
                <InfoRow
                  label={t('lastName')}
                  value={contact.lastName}
                  colors={colors}
                />
                <InfoRow
                  label={t('nickname')}
                  value={contact.nickname ?? t('none')}
                  colors={colors}
                />
                <InfoRow label={t('email')} value={contact.email} colors={colors} />
                <InfoRow label={t('phone')} value={contact.phone} colors={colors} />
                <InfoRow
                  label={t('address')}
                  value={contact.address}
                  colors={colors}
                />
                <InfoRow
                  label={t('favoriteBar')}
                  value={favoriteBarName(contact.favoriteBarId)}
                  colors={colors}
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
                  colors={colors}
                  variant="secondary"
                />
                <ActionButton
                  label={t('save')}
                  onPress={handleSave}
                  colors={colors}
                  variant="primary"
                />
              </>
            ) : (
              <>
                <ActionButton
                  label={t('editContact')}
                  onPress={() => setIsEditing(true)}
                  colors={colors}
                  variant="primary"
                />
                <ActionButton
                  label={t('deleteContact')}
                  onPress={handleDelete}
                  colors={colors}
                  variant="danger"
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ColorTokens;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.fieldLabel, { color: colors.accentMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  colors,
  variant,
}: {
  label: string;
  onPress: () => void;
  colors: ColorTokens;
  variant: 'primary' | 'secondary' | 'danger';
}) {
  const backgroundColor =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? '#8B1E1E'
        : colors.background;
  const textColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.white
        : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
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
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  infoRow: {
    gap: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
