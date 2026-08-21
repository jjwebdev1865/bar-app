import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
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
import { formatContactDisplayName } from '../../utils/contactFormat';
import { GroupMembersModal } from './GroupMembersModal';

type TGroupDetailStyles = ReturnType<typeof createStyles>;

type TActionButtonVariant = 'primary' | 'secondary' | 'danger';

interface IGroupDetailModalProps {
  group: TGroup | null;
  visible: boolean;
  availableContacts: TContact[];
  colors: TColorTokens;
  t: TTranslate;
  onClose: () => void;
  onSave: (group: TGroup) => void;
  onDelete: (group: TGroup) => void;
}

interface IInfoRowProps {
  label: string;
  value: string;
  styles: TGroupDetailStyles;
}

interface IActionButtonProps {
  label: string;
  onPress: () => void;
  variant: TActionButtonVariant;
  styles: TGroupDetailStyles;
  disabled?: boolean;
}

function calledTimesLabel(group: TGroup, t: TTranslate) {
  return t('calledTimes', {
    count: group.timesCalled,
    times: group.timesCalled === 1 ? t('time') : t('times'),
  });
}

function memberCountLabel(count: number, t: TTranslate) {
  return `${count} ${count === 1 ? t('contact') : t('contacts')}`;
}

function actionButtonStyle(
  variant: TActionButtonVariant,
  styles: TGroupDetailStyles,
) {
  if (variant === 'primary') {
    return styles.primaryActionButton;
  }

  if (variant === 'danger') {
    return styles.dangerActionButton;
  }

  return styles.secondaryActionButton;
}

function actionLabelStyle(
  variant: TActionButtonVariant,
  styles: TGroupDetailStyles,
) {
  if (variant === 'primary') {
    return styles.primaryActionLabel;
  }

  if (variant === 'danger') {
    return styles.dangerActionLabel;
  }

  return styles.secondaryActionLabel;
}

function InfoRow({ label, value, styles }: IInfoRowProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.infoRow}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  variant,
  styles,
  disabled,
}: IActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        actionButtonStyle(variant, styles),
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.actionButtonPressed,
      ]}
    >
      <Text style={actionLabelStyle(variant, styles)}>{label}</Text>
    </Pressable>
  );
}

export function GroupDetailModal({
  group,
  visible,
  availableContacts,
  colors,
  t,
  onClose,
  onSave,
  onDelete,
}: IGroupDetailModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [membersVisible, setMembersVisible] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setSelectedIds(group.contacts.map((contact) => contact.id));
      setIsEditing(false);
      setMembersVisible(false);
    }
  }, [group]);

  if (!group) {
    return null;
  }

  function resetDraft() {
    setName(group!.name);
    setSelectedIds(group!.contacts.map((contact) => contact.id));
  }

  function handleClose() {
    setIsEditing(false);
    setMembersVisible(false);
    onClose();
  }

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName || selectedIds.length === 0) {
      return;
    }

    onSave({
      ...group!,
      name: trimmedName,
      contacts: availableContacts.filter((contact) =>
        selectedIds.includes(contact.id),
      ),
    });
    setIsEditing(false);
  }

  function handleDelete() {
    setIsEditing(false);
    onDelete(group!);
  }

  const canSave = name.trim().length > 0 && selectedIds.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {isEditing ? t('editGroup') : group.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeLabel}>{t('close')}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              <>
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

                <View style={styles.field}>
                  <View
                    accessible
                    accessibilityLabel={`${t('members')}: ${memberCountLabel(
                      selectedIds.length,
                      t,
                    )}`}
                    style={styles.membersFieldHeader}
                  >
                    <Text style={styles.fieldLabel}>{t('members')}</Text>
                    <Text style={styles.membersFieldCount}>
                      {memberCountLabel(selectedIds.length, t)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('editGroupList')}
                    accessibilityHint={t('editGroupListHint')}
                    onPress={() => setMembersVisible(true)}
                    style={({ pressed }) => [
                      styles.editListRow,
                      pressed && styles.editListRowPressed,
                    ]}
                  >
                    <Text style={styles.editListLabel}>
                      {t('editGroupList')}
                    </Text>
                    <Text style={styles.editListChevron}>›</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <InfoRow
                  label={t('groupName')}
                  value={group.name}
                  styles={styles}
                />
                <View style={styles.infoRow}>
                  <View style={styles.membersFieldHeader}>
                    <Text style={styles.fieldLabel}>{t('members')}</Text>
                    <Text style={styles.membersFieldCount}>
                      {memberCountLabel(group.contacts.length, t)}
                    </Text>
                  </View>

                  {group.contacts.length === 0 ? (
                    <Text style={styles.infoValue}>{t('noMembers')}</Text>
                  ) : (
                    group.contacts.map((contact, index) => (
                      <Text
                        key={contact.id}
                        numberOfLines={1}
                        style={[
                          styles.memberListRow,
                          index < group.contacts.length - 1 &&
                            styles.memberListRowDivider,
                        ]}
                      >
                        {formatContactDisplayName(contact)}
                      </Text>
                    ))
                  )}
                </View>
                <InfoRow
                  label={t('timesCalled')}
                  value={calledTimesLabel(group, t)}
                  styles={styles}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {isEditing ? (
              <>
                <ActionButton
                  label={t('cancel')}
                  onPress={() => {
                    resetDraft();
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  styles={styles}
                />
                <ActionButton
                  label={t('save')}
                  onPress={handleSave}
                  variant="primary"
                  styles={styles}
                  disabled={!canSave}
                />
              </>
            ) : (
              <>
                <ActionButton
                  label={t('editGroup')}
                  onPress={() => setIsEditing(true)}
                  variant="primary"
                  styles={styles}
                />
                <ActionButton
                  label={t('deleteGroup')}
                  onPress={handleDelete}
                  variant="danger"
                  styles={styles}
                />
              </>
            )}
          </View>

          <GroupMembersModal
            visible={membersVisible}
            availableContacts={availableContacts}
            selectedIds={selectedIds}
            colors={colors}
            t={t}
            onCancel={() => setMembersVisible(false)}
            onSave={(ids) => {
              setSelectedIds(ids);
              setMembersVisible(false);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: TColorTokens) => {
  const actionButton = {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const actionLabel = {
    fontSize: 15,
    fontWeight: '700',
  } as const;

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.overlay,
    },
    sheet: {
      maxHeight: '85%',
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontWeight: '800',
      color: colors.accent,
    },
    closeButton: {
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    closeLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
    body: {
      flexGrow: 0,
    },
    bodyContent: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 14,
    },
    field: {
      gap: 6,
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
    infoRow: {
      gap: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    membersFieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    membersFieldCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accentMuted,
    },
    memberListRow: {
      paddingVertical: 10,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    memberListRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    editListRow: {
      minHeight: 44,
      paddingVertical: 6,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editListRowPressed: {
      opacity: 0.6,
    },
    editListLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    editListChevron: {
      fontSize: 22,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.accent,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    primaryActionButton: {
      ...actionButton,
      backgroundColor: colors.accent,
    },
    secondaryActionButton: {
      ...actionButton,
      backgroundColor: colors.background,
    },
    dangerActionButton: {
      ...actionButton,
      backgroundColor: colors.danger,
    },
    actionButtonPressed: {
      opacity: 0.8,
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    primaryActionLabel: {
      ...actionLabel,
      color: colors.onAccent,
    },
    secondaryActionLabel: {
      ...actionLabel,
      color: colors.text,
    },
    dangerActionLabel: {
      ...actionLabel,
      color: colors.white,
    },
  });
};
