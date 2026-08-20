import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  TColorTokens,
  TContact,
  TGroup,
  TTranslate,
} from '../../types/common.types';
import { CreateModal } from '../common/CreateModal';
import { formatContactDisplayName } from '../../utils/contactFormat';

interface ICreateGroupModalProps {
  visible: boolean;
  availableContacts: TContact[];
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onCreate: (group: TGroup) => void;
}

export function CreateGroupModal({
  visible,
  availableContacts,
  colors,
  t,
  onClose,
  onCreate,
}: ICreateGroupModalProps) {
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
          accessibilityLabel={t('groupName')}
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Text style={styles.fieldLabel}>{t('selectMembers')}</Text>

      <ScrollView
        style={styles.membersList}
        contentContainerStyle={styles.membersListContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {availableContacts.map((contact) => {
          const selected = selectedIds.includes(contact.id);

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
                style={selected ? styles.checkboxSelected : styles.checkboxDefault}
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
