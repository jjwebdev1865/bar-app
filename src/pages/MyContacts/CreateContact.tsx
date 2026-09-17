import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type KeyboardTypeOptions,
  type LayoutChangeEvent,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormDropdown, FormTextField } from '../../components/common';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import { useContactsStore } from '../../stores/contactsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import { useToastStore } from '../../stores/toastStore';
import type { TColorTokens, TTranslationKey } from '../../types/common.types';
import { EAppRoute } from '../../types/navigation.types';
import { formatPhoneInput } from '../../utils/phoneFormat';
import { formatZipInput } from '../../utils/zipFormat';
import {
  createContactFormSchema,
  isNameConflictError,
  type TContactFormValues,
} from '../../validation/contactSchema';

type TContactFieldName = keyof TContactFormValues;

interface IContactField {
  key: TContactFieldName;
  label: TTranslationKey;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
}

const emptyValues = (defaultBarId: string): TContactFormValues => ({
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
  favoriteBarId: defaultBarId,
});

/**
 * Rendered top to bottom in one scroll. `favoriteBarId` is absent because it is
 * a dropdown rather than a text field; it renders separately, after `phone`.
 */
const CONTACT_FIELDS: IContactField[] = [
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
  },
];

/** Index in `CONTACT_FIELDS` after which the favorite-bar dropdown renders. */
const FAVORITE_BAR_AFTER: TContactFieldName = 'phone';

export default function CreateContactScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  // The stack header sits above this screen, so the keyboard has that much less
  // room to push into.
  const headerHeight = useHeaderHeight();
  const locations = useLocationsStore((state) => state.locations);
  const existingContacts = useContactsStore((state) => state.contacts);
  const addContact = useContactsStore((state) => state.addContact);
  const showToast = useToastStore((state) => state.showToast);
  const defaultBarId = locations[0]?.id ?? '';

  const scrollRef = useRef<ScrollView>(null);
  // Filled by each field's `onLayout` so an invalid submit can scroll to the
  // offending field. The footer is pinned, so without this a validation failure
  // further up the form reads as a button that does nothing.
  const fieldOffsets = useRef<Partial<Record<TContactFieldName, number>>>({});

  // Rebuilt whenever the contact list changes so the duplicate-name check sees
  // the current roster — `useForm` re-reads its resolver on every render.
  const resolver = useMemo(
    () => zodResolver(createContactFormSchema(existingContacts)),
    [existingContacts],
  );

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<TContactFormValues>({
    resolver,
    // Errors appear once a field has been left, then keep up as it is retyped.
    mode: 'onTouched',
    // No reset-on-open effect: the route unmounts when it is popped, so every
    // push starts from a fresh form.
    defaultValues: emptyValues(defaultBarId),
  });

  const firstName = useWatch({ control, name: 'firstName' });
  const lastName = useWatch({ control, name: 'lastName' });
  const hasNameConflict =
    isNameConflictError(errors.firstName) ||
    isNameConflictError(errors.lastName);

  // The duplicate-name rule spans both name fields, but React Hook Form
  // revalidates only the field that changed. Without this, correcting the first
  // name would clear its own message and leave a stale conflict sitting under
  // the last name. Guarded on an active conflict so untouched fields are never
  // dragged into validation early.
  useEffect(() => {
    if (hasNameConflict) {
      void trigger(['firstName', 'lastName']);
    }
  }, [firstName, lastName, hasNameConflict, trigger]);

  const barOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [locations],
  );

  // `router.back()` alone would strand the user here when this screen is the
  // first in the stack — reachable via the `barsignal://` scheme, since
  // `/contacts/new` is a real deep-linkable route.
  function leaveForm() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(EAppRoute.CONTACTS);
  }

  function recordFieldOffset(key: TContactFieldName, event: LayoutChangeEvent) {
    fieldOffsets.current[key] = event.nativeEvent.layout.y;
  }

  function scrollToFirstError(formErrors: FieldErrors<TContactFormValues>) {
    const firstInvalid = CONTACT_FIELDS.find((field) => formErrors[field.key]);
    const offset = firstInvalid
      ? fieldOffsets.current[firstInvalid.key]
      : undefined;

    if (offset !== undefined) {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }
  }

  function handleCreate(values: TContactFormValues) {
    // `contactFormSchema` trims on parse, so these are already clean.
    addContact({
      id: `contact-${Date.now()}`,
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
    showToast('contactCreated');
    leaveForm();
  }

  const submit = handleSubmit(handleCreate, scrollToFirstError);

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <KeyboardAvoidingView
        // Android resizes the window itself; iOS needs the padding, offset by
        // the header so the footer clears the keyboard rather than hiding
        // behind it.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {CONTACT_FIELDS.map((field) => (
            <View
              key={field.key}
              onLayout={(event) => recordFieldOffset(field.key, event)}
              style={styles.fieldSlot}
            >
              <FormTextField
                control={control}
                name={field.key}
                label={field.label}
                keyboardType={field.keyboardType}
                autoCapitalize={field.autoCapitalize}
                format={field.format}
                colors={colors}
                t={t}
              />

              {field.key === FAVORITE_BAR_AFTER ? (
                <FormDropdown
                  control={control}
                  name="favoriteBarId"
                  label="favoriteBar"
                  placeholder="chooseLocation"
                  options={barOptions}
                  colors={colors}
                  t={t}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={leaveForm}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryLabel}>{t('cancel')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            // Stays pressable: `handleSubmit` renders each failure inline and
            // scrolls to the first one, rather than leaving a dead button.
            onPress={submit}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryLabel}>{t('addContact')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) => {
  const actionButton = {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const actionLabel = {
    fontSize: 16,
    fontWeight: '800',
  } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoider: {
      flex: 1,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      gap: 14,
    },
    fieldSlot: {
      gap: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.panel,
      borderTopColor: colors.border,
    },
    secondaryButton: {
      ...actionButton,
      backgroundColor: colors.background,
    },
    primaryButton: {
      ...actionButton,
      backgroundColor: colors.accent,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    secondaryLabel: {
      ...actionLabel,
      color: colors.text,
    },
    primaryLabel: {
      ...actionLabel,
      color: colors.onAccent,
    },
  });
};
