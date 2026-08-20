import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { TranslationKey } from '../../i18n';
import type { ColorTokens } from '../../theme/theme';
import type { Contact } from '../../data/contacts';
import type { Group } from '../../data/groups';
import { CreateModal } from '../common/CreateModal';

type CreateGroupModalProps = {
  visible: boolean;
  availableContacts: Contact[];
  colors: ColorTokens;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  onClose: () => void;
  onCreate: (group: Group) => void;
};

function contactDisplayName(contact: Contact) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

export function CreateGroupModal({
  visible,
  availableContacts,
  colors,
  t,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setName('');
      setSelectedIds([]);
    }
  }, [visible]);

  function toggleContact(contactId: string) {
    setSelectedIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  }

  function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName || selectedIds.length === 0) {
      return;
    }

    const contacts = availableContacts.filter((contact) =>
      selectedIds.includes(contact.id),
    );

    onCreate({
      id: `group-${Date.now()}`,
      name: trimmedName,
      contacts,
      timesCalled: 0,
    });
    onClose();
  }

  const canCreate = name.trim().length > 0 && selectedIds.length > 0;

  return (
    <CreateModal
      visible={visible}
      title={t('createGroup')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      canCreate={canCreate}
      colors={colors}
      onClose={onClose}
      onCreate={handleCreate}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('groupName')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Text style={styles.fieldLabel}>{t('selectMembers')}</Text>

      {availableContacts.map((contact, index) => {
        const selected = selectedIds.includes(contact.id);
        const isLast = index === availableContacts.length - 1;

        return (
          <Pressable
            key={contact.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            onPress={() => toggleContact(contact.id)}
            style={[styles.memberRow, !isLast && styles.memberRowSpacing]}
          >
            <Text style={styles.memberName} numberOfLines={1}>
              {contactDisplayName(contact)}
            </Text>
            <View
              style={selected ? styles.checkboxSelected : styles.checkboxDefault}
            >
              {selected ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </CreateModal>
  );
}

const createStyles = (colors: ColorTokens) => {
  const checkbox = {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return StyleSheet.create({
    field: {
      gap: 6,
      marginBottom: 6,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    input: {
      minHeight: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
      borderColor: colors.border,
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
    memberRowSpacing: {
      marginBottom: 0,
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
