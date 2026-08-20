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
  latitude: string;
  longitude: string;
};

const emptyDraft = (): TLocationDraft => ({
  name: '',
  address: '',
  latitude: '',
  longitude: '',
});

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
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    if (!name || !address || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    onCreate({
      id: `loc-${Date.now()}`,
      name,
      address,
      latitude,
      longitude,
    });
    onClose();
  }

  const canCreate =
    draft.name.trim().length > 0 &&
    draft.address.trim().length > 0 &&
    Number.isFinite(Number(draft.latitude)) &&
    draft.latitude.trim().length > 0 &&
    Number.isFinite(Number(draft.longitude)) &&
    draft.longitude.trim().length > 0;

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

      <View style={styles.row}>
        <View style={[styles.field, styles.rowField]}>
          <Text style={styles.fieldLabel}>{t('latitude')}</Text>
          <TextInput
            accessibilityLabel={t('latitude')}
            value={draft.latitude}
            onChangeText={(value) => updateField('latitude', value)}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={[styles.field, styles.rowField]}>
          <Text style={styles.fieldLabel}>{t('longitude')}</Text>
          <TextInput
            accessibilityLabel={t('longitude')}
            value={draft.longitude}
            onChangeText={(value) => updateField('longitude', value)}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
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
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    rowField: {
      flex: 1,
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
  });
};
