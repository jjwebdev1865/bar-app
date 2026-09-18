import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import { FormScreen, FormTextField } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { useLocationsStore } from '../../stores/locationsStore';
import { useToastStore } from '../../stores/toastStore';
import type { TTranslationKey } from '../../types/common.types';
import { EAppRoute } from '../../types/navigation.types';
import { formatZipInput } from '../../utils/zipFormat';
import {
  locationFormSchema,
  type TLocationFormValues,
} from '../../validation/locationSchema';

type TLocationFieldName = keyof TLocationFormValues;

interface ILocationField {
  key: TLocationFieldName;
  label: TTranslationKey;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
}

const emptyValues = (): TLocationFormValues => ({
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
});

/** Rendered top to bottom in one scroll, same order as `CONTACT_FIELDS`. */
const LOCATION_FIELDS: ILocationField[] = [
  { key: 'name', label: 'locationName', autoCapitalize: 'words' },
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

export default function CreateLocationScreen() {
  const { colors, t } = useSettings();
  const addLocation = useLocationsStore((state) => state.addLocation);
  const showToast = useToastStore((state) => state.showToast);

  const { control, handleSubmit } = useForm<TLocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    // Errors appear once a field has been left, then keep up as it is retyped.
    mode: 'onTouched',
    // No reset-on-open effect: the route unmounts when it is popped, so every
    // push starts from a fresh form.
    defaultValues: emptyValues(),
  });

  // `FormScreen` leaves the route once this resolves.
  function handleCreate(values: TLocationFormValues) {
    // `locationFormSchema` trims on parse, so these are already clean.
    addLocation({
      id: `loc-${Date.now()}`,
      name: values.name,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      zip: values.zip,
      // Coordinates are not part of the form — the create flow assigns them.
      ...getRandomCoordinates(),
    });
    showToast('locationCreated');
  }

  return (
    <FormScreen
      handleSubmit={handleSubmit}
      onSubmit={handleCreate}
      submitLabel="addLocation"
      cancelLabel="cancel"
      fallbackRoute={EAppRoute.LOCATIONS}
      colors={colors}
      t={t}
    >
      {/* Each field stays a direct child of the scroll content so
          `useFieldLayout` measures its offset against the form. */}
      {LOCATION_FIELDS.map((field) => (
        <FormTextField
          key={field.key}
          control={control}
          name={field.key}
          label={field.label}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          format={field.format}
          colors={colors}
          t={t}
        />
      ))}
    </FormScreen>
  );
}
