import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import { useLocationsStore } from '../../stores/locationsStore';
import type {
  TColorTokens,
  TContact,
  TTranslate,
  TTranslationKey,
} from '../../types/common.types';
import {
  contactFormSchema,
  type TContactFormValues,
} from '../../validation/contactSchema';
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
}

const emptyValues = (defaultBarId: string): TContactFormValues => ({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  address: '',
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
    { key: 'phone', label: 'phone', keyboardType: 'phone-pad' },
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
  const locations = useLocationsStore((state) => state.locations);
  const defaultBarId = locations[0]?.id ?? '';
  const [step, setStep] = useState(0);

  const { control, handleSubmit, reset, trigger } = useForm<TContactFormValues>(
    {
      resolver: zodResolver(contactFormSchema),
      // Errors appear once a field has been left, then keep up as it is retyped.
      mode: 'onTouched',
      defaultValues: emptyValues(defaultBarId),
    },
  );

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
      address: values.address,
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
