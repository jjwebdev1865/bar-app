import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useLocationsStore } from '../../stores/locationsStore';
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

const emptyDraft = (defaultBarId: string): TContactDraft => ({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  address: '',
  favoriteBarId: defaultBarId,
});

const STEP_COUNT = 3;

const STEP_FIELDS: {
  key: keyof TContactDraft;
  label: TTranslationKey;
  multiline?: boolean;
}[][] = [
  [
    { key: 'firstName', label: 'firstName' },
    { key: 'lastName', label: 'lastName' },
    { key: 'nickname', label: 'nickname' },
  ],
  [
    { key: 'email', label: 'email' },
    { key: 'phone', label: 'phone' },
  ],
  [{ key: 'address', label: 'address', multiline: true }],
];

export function CreateContactModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateContactModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locations = useLocationsStore((state) => state.locations);
  const defaultBarId = locations[0]?.id ?? '';
  const [draft, setDraft] = useState<TContactDraft>(() =>
    emptyDraft(defaultBarId),
  );
  const [barDropdownOpen, setBarDropdownOpen] = useState(false);
  const [step, setStep] = useState(0);

  const barOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [locations],
  );

  // `defaultBarId` is deliberately not a dependency — reopening the modal is what
  // should reset the draft, not a location being added while it is already open.
  useEffect(() => {
    if (visible) {
      setDraft(emptyDraft(defaultBarId));
      setBarDropdownOpen(false);
      setStep(0);
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

  function handlePrevious() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleNext() {
    setStep((current) => Math.min(current + 1, STEP_COUNT - 1));
  }

  const canCreate =
    draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;
  const isFirstStep = step === 0;
  const isLastStep = step === STEP_COUNT - 1;

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
      leftLabel={isFirstStep ? t('cancel') : t('previous')}
      onLeft={isFirstStep ? handleClose : handlePrevious}
      rightLabel={isLastStep ? t('addContact') : t('next')}
      rightDisabled={!canCreate}
      onRight={isLastStep ? handleCreate : handleNext}
    >
      {STEP_FIELDS[step].map((field) => (
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

      {step === 1 ? (
        <Dropdown
          label={t('favoriteBar')}
          placeholder={t('chooseLocation')}
          options={barOptions}
          value={draft.favoriteBarId}
          open={barDropdownOpen}
          onOpenChange={setBarDropdownOpen}
          onChange={(value) => updateField('favoriteBarId', value)}
          colors={colors}
        />
      ) : null}
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
