import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { useForm } from 'react-hook-form';

import { useLocationsStore } from '../../stores/locationsStore';
import type {
  TBarLocation,
  TColorTokens,
  TContact,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import {
  contactFormSchema,
  type TContactFormValues,
} from '../../validation/contactSchema';
import {
  formatPhoneDisplay,
  formatPhoneInput,
  PHONE_DISPLAY_LENGTH,
} from '../../utils/phoneFormat';
import { formatZipInput, ZIP_DISPLAY_LENGTH } from '../../utils/zipFormat';
import { FormDropdown } from '../common/FormDropdown';
import { FormTextField } from '../common/FormTextField';
import {
  formatContactAddress,
  formatContactDisplayName,
} from '../../utils/contactFormat';

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

interface IEditField {
  key: keyof TContactFormValues;
  label: TTranslationKey;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
  maxLength?: number;
}

const EDIT_FIELDS: IEditField[] = [
  { key: 'firstName', label: 'firstName', autoCapitalize: 'words' },
  { key: 'lastName', label: 'lastName', autoCapitalize: 'words' },
  { key: 'nickname', label: 'nickname', autoCapitalize: 'words' },
  {
    key: 'email',
    label: 'email',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    key: 'phone',
    label: 'phone',
    keyboardType: 'phone-pad',
    format: formatPhoneInput,
    maxLength: PHONE_DISPLAY_LENGTH,
  },
  { key: 'addressLine1', label: 'addressLine1', autoCapitalize: 'words' },
  { key: 'addressLine2', label: 'addressLine2', autoCapitalize: 'words' },
  { key: 'city', label: 'city', autoCapitalize: 'words' },
  { key: 'state', label: 'state', autoCapitalize: 'words' },
  {
    key: 'zip',
    label: 'zip',
    keyboardType: 'number-pad',
    format: formatZipInput,
    maxLength: ZIP_DISPLAY_LENGTH,
  },
];

function toFormValues(contact: TContact): TContactFormValues {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    nickname: contact.nickname ?? '',
    email: contact.email,
    // Seeded through the display formatter so the edit field opens showing the
    // same text as the read view, rather than waiting for the first keystroke
    // to pull a differently-formatted stored number into the mask.
    phone: formatPhoneDisplay(contact.phone),
    addressLine1: contact.addressLine1,
    addressLine2: contact.addressLine2,
    city: contact.city,
    state: contact.state,
    zip: contact.zip,
    favoriteBarId: contact.favoriteBarId,
  };
}

function favoriteBarName(
  favoriteBarId: string,
  locations: TBarLocation[],
  t: TTranslate,
) {
  // `locationsStore.removeLocation` clears the id when the bar is deleted.
  if (!favoriteBarId) {
    return t('none');
  }

  return (
    locations.find((location) => location.id === favoriteBarId)?.name ??
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
  const locations = useLocationsStore((state) => state.locations);
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset } = useForm<TContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onTouched',
    // Real values arrive via `reset` once a contact is selected; these just
    // keep every input controlled from the first render.
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      favoriteBarId: '',
    },
  });

  const barOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [locations],
  );

  useEffect(() => {
    if (contact) {
      reset(toFormValues(contact));
      setIsEditing(false);
    }
  }, [contact, reset]);

  if (!contact) {
    return null;
  }

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  function handleSave(values: TContactFormValues) {
    // `contactFormSchema` trims on parse, so these are already clean.
    onSave({
      ...contact!,
      firstName: values.firstName,
      lastName: values.lastName,
      nickname: values.nickname || undefined,
      email: values.email,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      zip: values.zip,
      favoriteBarId: values.favoriteBarId,
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    reset(toFormValues(contact!));
    setIsEditing(false);
  }

  function handleDelete() {
    setIsEditing(false);
    onDelete(contact!);
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
                {EDIT_FIELDS.map((field) => (
                  <FormTextField
                    key={field.key}
                    control={control}
                    name={field.key}
                    label={field.label}
                    multiline={field.multiline}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    format={field.format}
                    maxLength={field.maxLength}
                    colors={colors}
                    t={t}
                  />
                ))}

                <FormDropdown
                  control={control}
                  name="favoriteBarId"
                  label="favoriteBar"
                  placeholder="chooseLocation"
                  options={barOptions}
                  colors={colors}
                  t={t}
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
                  value={formatPhoneDisplay(contact.phone)}
                  styles={styles}
                />
                <InfoRow
                  label={t('address')}
                  // Blank parts collapse away, so a contact with no address at
                  // all leaves the formatter empty rather than showing gaps.
                  value={formatContactAddress(contact) || t('none')}
                  styles={styles}
                />
                <InfoRow
                  label={t('favoriteBar')}
                  value={favoriteBarName(contact.favoriteBarId, locations, t)}
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
