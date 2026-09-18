import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import {
  FormDropdown,
  FormScreen,
  FormTextField,
} from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { useContactsStore } from '../../stores/contactsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import { useToastStore } from '../../stores/toastStore';
import type { TTranslationKey } from '../../types/common.types';
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
  const locations = useLocationsStore((state) => state.locations);
  const existingContacts = useContactsStore((state) => state.contacts);
  const addContact = useContactsStore((state) => state.addContact);
  const showToast = useToastStore((state) => state.showToast);
  const defaultBarId = locations[0]?.id ?? '';

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

  // `FormScreen` leaves the route once this resolves.
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
  }

  return (
    <FormScreen
      handleSubmit={handleSubmit}
      onSubmit={handleCreate}
      submitLabel="addContact"
      cancelLabel="cancel"
      fallbackRoute={EAppRoute.CONTACTS}
      colors={colors}
      t={t}
    >
      {CONTACT_FIELDS.map((field) => (
        // A `Fragment` rather than a wrapper `View`: each field has to stay a
        // direct child of the scroll content for `useFieldLayout` to measure
        // its offset against the form. Spacing is unaffected — the scroll
        // content already carries the gap.
        <Fragment key={field.key}>
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
        </Fragment>
      ))}
    </FormScreen>
  );
}
