import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useContactsStore } from '../../stores/contactsStore';
import type { TColorTokens, TTranslate } from '../../types/common.types';
import { CreateModal } from '../common/CreateModal';
import { formatContactDisplayName } from '../../utils/contactFormat';

interface IGroupMembersModalProps {
  visible: boolean;
  selectedIds: string[];
  colors: TColorTokens;
  t: TTranslate;
  onCancel: () => void;
  onSave: (selectedIds: string[]) => void;
}

/**
 * Member picker opened from `GroupDetailModal`'s edit mode. It holds its own
 * draft selection so Cancel discards the changes and Save hands the final ids
 * back — either way the user lands back on the edit group modal.
 */
export function GroupMembersModal({
  visible,
  selectedIds,
  colors,
  t,
  onCancel,
  onSave,
}: IGroupMembersModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const availableContacts = useContactsStore((state) => state.contacts);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (visible) {
      setDraftIds(selectedIds);
    }
    // `selectedIds` is only read when the picker opens — a new array identity
    // from the parent mid-edit must not wipe the in-progress draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function toggleContact(contactId: string) {
    setDraftIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  }

  return (
    <CreateModal
      visible={visible}
      title={t('selectMembers')}
      closeLabel={t('close')}
      cancelLabel={t('cancel')}
      createLabel={t('save')}
      canCreate={draftIds.length > 0}
      colors={colors}
      onClose={onCancel}
      onCreate={() => onSave(draftIds)}
    >
      {availableContacts.length === 0 ? (
        <Text style={styles.empty}>{t('noContacts')}</Text>
      ) : (
        availableContacts.map((contact) => {
          const selected = draftIds.includes(contact.id);

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
        })
      )}
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
    empty: {
      textAlign: 'center',
      paddingVertical: 24,
      fontSize: 15,
      color: colors.accentMuted,
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
