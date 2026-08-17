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

import type { TranslationKey } from '../../i18n';
import type { ColorTokens } from '../../theme/theme';
import type { Contact } from '../../data/contacts';
import { mockLocations } from '../../data/locations';
import { Dropdown } from '../common/Dropdown';

type CreateContactModalProps = {
  visible: boolean;
  colors: ColorTokens;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  onClose: () => void;
  onCreate: (contact: Contact) => void;
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

const emptyDraft = (): ContactDraft => ({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  address: '',
  favoriteBarId: mockLocations[0]?.id ?? '',
});

export function CreateContactModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: CreateContactModalProps) {
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const [barDropdownOpen, setBarDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(emptyDraft());
      setBarDropdownOpen(false);
    }
  }, [visible]);

  function updateField<K extends keyof ContactDraft>(
    key: K,
    value: ContactDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleClose() {
    setBarDropdownOpen(false);
    onClose();
  }

  function handleCreate() {
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();

    if (!firstName || !lastName) {
      return;
    }

    const contact: Contact = {
      id: `contact-${Date.now()}`,
      firstName,
      lastName,
      nickname: draft.nickname.trim() || undefined,
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      favoriteBarId: draft.favoriteBarId,
    };

    onCreate(contact);
    handleClose();
  }

  const canCreate =
    draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;

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
            <Text style={[styles.title, { color: colors.accent }]}>
              {t('createContact')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={handleClose}
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
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleClose}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                {t('cancel')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!canCreate}
              onPress={handleCreate}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.border,
                  opacity: !canCreate ? 0.45 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.actionLabel, { color: colors.onAccent }]}>
                {t('create')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
