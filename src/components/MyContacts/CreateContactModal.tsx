import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import { useContactsStore } from '../../stores/contactsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import type {
  TColorTokens,
  TContact,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import {
  createContactFormSchema,
  isNameConflictError,
  type TContactFormValues,
} from '../../validation/contactSchema';
import {
  formatPhoneInput,
  PHONE_DISPLAY_LENGTH,
} from '../../utils/phoneFormat';
import { formatZipInput, ZIP_DISPLAY_LENGTH } from '../../utils/zipFormat';
import { CreateModal } from '../common/CreateModal';
import { FormDropdown } from '../common/FormDropdown';
import { FormTextField } from '../common/FormTextField';

interface ICreateContactModalProps {
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (contact: TContact) => void;
}

interface IStepField {
  key: keyof TContactFormValues;
  label: TTranslationKey;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
  maxLength?: number;
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

const STEP_COUNT = 3;

const STEP_FIELDS: IStepField[][] = [
  [
    { key: 'firstName', label: 'firstName', autoCapitalize: 'words' },
    { key: 'lastName', label: 'lastName', autoCapitalize: 'words' },
    { key: 'nickname', label: 'nickname', autoCapitalize: 'words' },
  ],
  [
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
  ],
  [
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
  ],
];

export function CreateContactModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateContactModalProps) {
  const locations = useLocationsStore((state) => state.locations);
  const existingContacts = useContactsStore((state) => state.contacts);
  const defaultBarId = locations[0]?.id ?? '';
  const [step, setStep] = useState(0);

  // Rebuilt whenever the contact list changes so the duplicate-name check sees
  // the current roster — `useForm` re-reads its resolver on every render.
  const resolver = useMemo(
    () => zodResolver(createContactFormSchema(existingContacts)),
    [existingContacts],
  );

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TContactFormValues>({
    resolver,
    // Errors appear once a field has been left, then keep up as it is retyped.
    mode: 'onTouched',
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

  // `defaultBarId` is deliberately not a dependency — reopening the modal is what
  // should reset the draft, not a location being added while it is already open.
  useEffect(() => {
    if (visible) {
      reset(emptyValues(defaultBarId));
      setStep(0);
    }
  }, [visible]);

  function handleCreate(values: TContactFormValues) {
    // `contactFormSchema` trims on parse, so these are already clean.
    onCreate({
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
    onClose();
  }

  function handlePrevious() {
    setStep((current) => Math.max(current - 1, 0));
  }

  // Gate on the current step's fields only, so the wizard surfaces the error
  // where it happened instead of letting the user walk to the end and find a
  // dead Add button.
  async function handleNext() {
    const stepIsValid = await trigger(
      STEP_FIELDS[step].map((field) => field.key),
    );

    if (stepIsValid) {
      setStep((current) => Math.min(current + 1, STEP_COUNT - 1));
    }
  }

  const isFirstStep = step === 0;
  const isLastStep = step === STEP_COUNT - 1;
  const submit = handleSubmit(handleCreate);

  return (
    <CreateModal
      visible={visible}
      title={t('createContact')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      // Next/Add stay pressable: `handleNext` gates on the current step's
      // fields and `handleSubmit` gates the last one, both of which render the
      // reason inline instead of leaving a dead button.
      canCreate
      colors={colors}
      onClose={onClose}
      onCreate={submit}
      leftLabel={isFirstStep ? t('cancel') : t('previous')}
      onLeft={isFirstStep ? onClose : handlePrevious}
      rightLabel={isLastStep ? t('addContact') : t('next')}
      onRight={isLastStep ? submit : handleNext}
    >
      {STEP_FIELDS[step].map((field) => (
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

      {step === 1 ? (
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
    </CreateModal>
  );
}
