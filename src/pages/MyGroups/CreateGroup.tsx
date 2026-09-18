import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import {
  FormChecklist,
  FormScreen,
  FormTextField,
} from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { useContactsStore } from '../../stores/contactsStore';
import { useGroupsStore } from '../../stores/groupsStore';
import { useToastStore } from '../../stores/toastStore';
import { EAppRoute } from '../../types/navigation.types';
import { formatContactDisplayName } from '../../utils/contactFormat';
import {
  groupFormSchema,
  type TGroupFormValues,
} from '../../validation/groupSchema';

const emptyValues = (): TGroupFormValues => ({
  name: '',
  contactIds: [],
});

export default function CreateGroupScreen() {
  const { colors, t } = useSettings();
  const availableContacts = useContactsStore((state) => state.contacts);
  const addGroup = useGroupsStore((state) => state.addGroup);
  const showToast = useToastStore((state) => state.showToast);

  const { control, handleSubmit } = useForm<TGroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    // Errors appear once a field has been left, then keep up as it is retyped.
    mode: 'onTouched',
    // No reset-on-open effect: the route unmounts when it is popped, so every
    // push starts from a fresh form.
    defaultValues: emptyValues(),
  });

  const memberOptions = useMemo(
    () =>
      availableContacts.map((contact) => ({
        value: contact.id,
        label: formatContactDisplayName(contact),
      })),
    [availableContacts],
  );

  // `FormScreen` leaves the route once this resolves.
  function handleCreate(values: TGroupFormValues) {
    addGroup({
      id: `group-${Date.now()}`,
      // `groupFormSchema` trims on parse, so this is already clean.
      name: values.name,
      // The form holds member *ids*; resolving them here is what keeps the
      // `TGroup.contacts` copies built from current contact records.
      contacts: availableContacts.filter((contact) =>
        values.contactIds.includes(contact.id),
      ),
    });
    showToast('groupCreated');
  }

  return (
    <FormScreen
      handleSubmit={handleSubmit}
      onSubmit={handleCreate}
      submitLabel="addGroup"
      cancelLabel="cancel"
      fallbackRoute={EAppRoute.GROUPS}
      colors={colors}
      t={t}
    >
      <FormTextField
        control={control}
        name="name"
        label="groupName"
        autoCapitalize="words"
        colors={colors}
        t={t}
      />

      <FormChecklist
        control={control}
        name="contactIds"
        label="selectMembers"
        options={memberOptions}
        colors={colors}
        t={t}
      />
    </FormScreen>
  );
}
