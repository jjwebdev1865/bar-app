import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';

import { useContactsStore } from '../../stores/contactsStore';
import type {
  TBarLocation,
  TColorTokens,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import {
  locationFormSchema,
  type TLocationFormValues,
} from '../../validation/locationSchema';
import { FormTextField } from '../common/FormTextField';
import {
  countFavoriteContacts,
  formatFavoriteOfLabel,
} from '../../utils/locationFormat';

type TLocationDetailStyles = ReturnType<typeof createStyles>;

type TActionButtonVariant = 'primary' | 'secondary' | 'danger';

interface IEditField {
  key: keyof TLocationFormValues;
  label: TTranslationKey;
  multiline?: boolean;
}

const EDIT_FIELDS: IEditField[] = [
  { key: 'name', label: 'locationName' },
  { key: 'address', label: 'address', multiline: true },
];

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

function toFormValues(location: TBarLocation): TLocationFormValues {
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

  const { control, handleSubmit, reset } = useForm<TLocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    mode: 'onTouched',
    // Real values arrive via `reset` once a location is selected; these just
    // keep every input controlled from the first render.
    defaultValues: { name: '', address: '' },
  });

  useEffect(() => {
    if (location) {
      reset(toFormValues(location));
      setIsEditing(false);
    }
  }, [location, reset]);

  if (!location) {
    return null;
  }

  const favoriteCount = countFavoriteContacts(location, contacts);

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  function handleSave(values: TLocationFormValues) {
    // `locationFormSchema` trims on parse, so these are already clean.
    // Coordinates are not editable here — the create flow assigns them, so an
    // edit carries the existing pair through untouched.
    onSave({ ...location!, name: values.name, address: values.address });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    reset(toFormValues(location!));
    setIsEditing(false);
  }

  function handleDelete() {
    setIsEditing(false);
    onDelete(location!);
  }

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
              EDIT_FIELDS.map((field) => (
                <FormTextField
                  key={field.key}
                  control={control}
                  name={field.key}
                  label={field.label}
                  multiline={field.multiline}
                  autoCapitalize="words"
                  colors={colors}
                  t={t}
                />
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
                  onPress={handleCancelEdit}
                  variant="secondary"
                  styles={styles}
                />
                <ActionButton
                  label={t('save')}
                  onPress={handleSubmit(handleSave)}
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
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.accentMuted,
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
