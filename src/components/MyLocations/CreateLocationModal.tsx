import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type {
  TBarLocation,
  TColorTokens,
  TTranslate,
} from '../../types/common.types';
import {
  locationFormSchema,
  type TLocationFormValues,
} from '../../validation/locationSchema';
import { CreateModal } from '../common/CreateModal';
import { FormTextField } from '../common/FormTextField';

interface ICreateLocationModalProps {
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (location: TBarLocation) => void;
}

const emptyValues = (): TLocationFormValues => ({
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
  const { control, handleSubmit, reset } = useForm<TLocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    mode: 'onTouched',
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (visible) {
      reset(emptyValues());
    }
  }, [visible, reset]);

  function handleCreate(values: TLocationFormValues) {
    // `locationFormSchema` trims on parse, so these are already clean.
    onCreate({
      id: `loc-${Date.now()}`,
      name: values.name,
      address: values.address,
      ...getRandomCoordinates(),
    });
    onClose();
  }

  return (
    <CreateModal
      visible={visible}
      title={t('createLocation')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      // Create stays pressable so `handleSubmit` can surface the errors rather
      // than leaving the user with a dead button and no explanation.
      canCreate
      colors={colors}
      onClose={onClose}
      onCreate={handleSubmit(handleCreate)}
    >
      <FormTextField
        control={control}
        name="name"
        label="locationName"
        autoCapitalize="words"
        colors={colors}
        t={t}
      />

      <FormTextField
        control={control}
        name="address"
        label="address"
        colors={colors}
        t={t}
      />
    </CreateModal>
  );
}
