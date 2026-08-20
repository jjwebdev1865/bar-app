import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { MOCK_LOCATIONS } from '../../data/locations';
import type {
  TColorTokens,
  TContact,
  TContactDraft,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import { CreateModal } from '../common/CreateModal';
import { Dropdown } from '../common/Dropdown';

interface ICreateContactModalProps {
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (contact: TContact) => void;
}

const emptyDraft = (): TContactDraft => ({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  address: '',
  favoriteBarId: MOCK_LOCATIONS[0]?.id ?? '',
});

export function CreateContactModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateContactModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<TContactDraft>(emptyDraft);
  const [barDropdownOpen, setBarDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(emptyDraft());
      setBarDropdownOpen(false);
    }
  }, [visible]);

  function updateField<K extends keyof TContactDraft>(
    key: K,
    value: TContactDraft[K],
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

    const contact: TContact = {
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
    <CreateModal
      visible={visible}
      title={t('createContact')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      canCreate={canCreate}
      colors={colors}
      onClose={handleClose}
      onCreate={handleCreate}
    >
      {fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.fieldLabel}>{t(field.label)}</Text>
          <TextInput
            accessibilityLabel={t(field.label)}
            value={draft[field.key]}
            onChangeText={(value) => updateField(field.key, value)}
            multiline={field.multiline}
            style={field.multiline ? styles.multilineInput : styles.input}
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
    </CreateModal>
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

  return StyleSheet.create({
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
  });
};
