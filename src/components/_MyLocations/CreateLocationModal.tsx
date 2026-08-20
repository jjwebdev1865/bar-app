import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { TranslationKey } from '../../i18n';
import type { ColorTokens } from '../../theme/theme';
import type { BarLocation } from '../../data/locations';
import { CreateModal } from '../common/CreateModal';

type CreateLocationModalProps = {
  visible: boolean;
  colors: ColorTokens;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  onClose: () => void;
  onCreate: (location: BarLocation) => void;
};

type LocationDraft = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
};

const emptyDraft = (): LocationDraft => ({
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
}: CreateLocationModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);

  useEffect(() => {
    if (visible) {
      setDraft(emptyDraft());
    }
  }, [visible]);

  function updateField<K extends keyof LocationDraft>(
    key: K,
    value: LocationDraft[K],
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
          value={draft.name}
          onChangeText={(value) => updateField('name', value)}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('address')}</Text>
        <TextInput
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

const createStyles = (colors: ColorTokens) => {
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
