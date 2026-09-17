import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useController, useForm } from 'react-hook-form';

import { useContactsStore } from '../../stores/contactsStore';
import type {
  TColorTokens,
  TGroup,
  TTranslate,
} from '../../types/common.types';
import {
  groupFormSchema,
  type TGroupFormValues,
} from '../../validation/groupSchema';
import { translateFieldError } from '../../validation/messages';
import { CreateModal } from '../common/CreateModal';
import { FormTextField } from '../common/FormTextField';
import { formatContactDisplayName } from '../../utils/contactFormat';

interface ICreateGroupModalProps {
  visible: boolean;
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (group: TGroup) => void;
}

const emptyValues = (): TGroupFormValues => ({
  name: '',
  contactIds: [],
});

export function CreateGroupModal({
  visible,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateGroupModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const availableContacts = useContactsStore((state) => state.contacts);

  const { control, handleSubmit, reset } = useForm<TGroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onTouched',
    defaultValues: emptyValues(),
  });

  // The member list is a custom control rather than a text input, so it binds
  // through `useController` directly.
  const { field: contactIds, fieldState: contactIdsState } = useController({
    control,
    name: 'contactIds',
  });

  const membersError = translateFieldError(t, contactIdsState.error?.message);

  useEffect(() => {
    if (visible) {
      reset(emptyValues());
    }
  }, [visible, reset]);

  function toggleContact(contactId: string) {
    const selected = contactIds.value;

    contactIds.onChange(
      selected.includes(contactId)
        ? selected.filter((id) => id !== contactId)
        : [...selected, contactId],
    );
  }

  function handleCreate(values: TGroupFormValues) {
    onCreate({
      id: `group-${Date.now()}`,
      name: values.name,
      contacts: availableContacts.filter((contact) =>
        values.contactIds.includes(contact.id),
      ),
    });
    onClose();
  }

  return (
    <CreateModal
      visible={visible}
      title={t('createGroup')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      // Create stays pressable so `handleSubmit` can surface the errors — a
      // disabled button would hide why nothing is happening, and the member
      // list has no blur event to trigger `onTouched` validation.
      canCreate
      colors={colors}
      onClose={onClose}
      onCreate={handleSubmit(handleCreate)}
    >
      <FormTextField
        control={control}
        name="name"
        label="groupName"
        autoCapitalize="words"
        colors={colors}
        t={t}
      />

      <Text style={styles.fieldLabel}>{t('selectMembers')}</Text>
      {membersError ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {membersError}
        </Text>
      ) : null}

      <ScrollView
        style={styles.membersList}
        contentContainerStyle={styles.membersListContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {availableContacts.map((contact) => {
          const selected = contactIds.value.includes(contact.id);

          return (
            <Pressable
              key={contact.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => toggleContact(contact.id)}
              style={styles.memberRow}
            >
              <Text style={styles.memberName} numberOfLines={1}>
                {formatContactDisplayName(contact)}
              </Text>
              <View
                style={
                  selected ? styles.checkboxSelected : styles.checkboxDefault
                }
              >
                {selected ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </CreateModal>
  );
}

const createStyles = (colors: TColorTokens) => {
  const checkbox = {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return StyleSheet.create({
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.danger,
    },
    membersList: {
      maxHeight: 240,
    },
    membersListContent: {
      gap: 8,
      paddingBottom: 4,
    },
    memberRow: {
      minHeight: 48,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    memberName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    checkboxSelected: {
      ...checkbox,
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    checkboxDefault: {
      ...checkbox,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    checkmark: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.onAccent,
    },
  });
};
