import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type {
  TBarLocation,
  TColorTokens,
  TTranslate,
} from '../../types/common.types';
import { CreateModal } from '../common/CreateModal';

interface ICreateLocationModalProps {
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (location: TBarLocation) => void;
}

type TLocationDraft = {
  name: string;
  address: string;
};

const emptyDraft = (): TLocationDraft => ({
  name: '',
  address: '',
});

// Mock locations cluster around Gotham City — keep random assignments in the same area.
const GOTHAM_LATITUDE_RANGE: [number, number] = [40.68, 40.79];
const GOTHAM_LONGITUDE_RANGE: [number, number] = [-74.05, -73.96];

function randomInRange([min, max]: [number, number]) {
  return Math.random() * (max - min) + min;
}

function getRandomCoordinates() {
  return {
    latitude: randomInRange(GOTHAM_LATITUDE_RANGE),
    longitude: randomInRange(GOTHAM_LONGITUDE_RANGE),
  };
}

export function CreateLocationModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateLocationModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<TLocationDraft>(emptyDraft);

  useEffect(() => {
    if (visible) {
      setDraft(emptyDraft());
    }
  }, [visible]);

  function updateField<K extends keyof TLocationDraft>(
    key: K,
    value: TLocationDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleCreate() {
    const name = draft.name.trim();
    const address = draft.address.trim();

    if (!name || !address) {
      return;
    }

    onCreate({
      id: `loc-${Date.now()}`,
      name,
      address,
      ...getRandomCoordinates(),
    });
    onClose();
  }

  const canCreate =
    draft.name.trim().length > 0 && draft.address.trim().length > 0;

  return (
    <CreateModal
      visible={visible}
      title={t('createLocation')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      canCreate={canCreate}
      colors={colors}
      onClose={onClose}
      onCreate={handleCreate}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('locationName')}</Text>
        <TextInput
          accessibilityLabel={t('locationName')}
          value={draft.name}
          onChangeText={(value) => updateField('name', value)}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('address')}</Text>
        <TextInput
          accessibilityLabel={t('address')}
          value={draft.address}
          onChangeText={(value) => updateField('address', value)}
          multiline
          style={styles.multilineInput}
          placeholderTextColor={colors.textMuted}
        />
      </View>
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
