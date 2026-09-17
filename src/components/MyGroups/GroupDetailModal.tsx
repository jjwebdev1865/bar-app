import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { FormTextField } from '../common/FormTextField';
import { formatContactDisplayName } from '../../utils/contactFormat';
import { GroupMembersModal } from './GroupMembersModal';

type TGroupDetailStyles = ReturnType<typeof createStyles>;

type TActionButtonVariant = 'primary' | 'secondary' | 'danger';

interface IGroupDetailModalProps {
  group: TGroup | null;
  visible: boolean;
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
}

function memberCountLabel(count: number, t: TTranslate) {
  return `${count} ${count === 1 ? t('contact') : t('contacts')}`;
}

function toFormValues(group: TGroup): TGroupFormValues {
  return {
    name: group.name,
    contactIds: group.contacts.map((contact) => contact.id),
  };
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

function ActionButton({ label, onPress, variant, styles }: IActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        actionButtonStyle(variant, styles),
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text style={actionLabelStyle(variant, styles)}>{label}</Text>
    </Pressable>
  );
}

export function GroupDetailModal({
  group,
  visible,
  colors,
  t,
  onClose,
  onSave,
  onDelete,
}: IGroupDetailModalProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const availableContacts = useContactsStore((state) => state.contacts);
  const [isEditing, setIsEditing] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm<TGroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onTouched',
    defaultValues: { name: '', contactIds: [] },
  });

  // The member picker is a custom control rather than a text input, so it binds
  // through `useController` directly.
  const { field: contactIds, fieldState: contactIdsState } = useController({
    control,
    name: 'contactIds',
  });

  useEffect(() => {
    if (group) {
      reset(toFormValues(group));
      setIsEditing(false);
      setMembersVisible(false);
    }
  }, [group, reset]);

  if (!group) {
    return null;
  }

  const membersError = translateFieldError(t, contactIdsState.error?.message);
  const selectedIds = contactIds.value;

  function handleClose() {
    setIsEditing(false);
    setMembersVisible(false);
    onClose();
  }

  function handleSave(values: TGroupFormValues) {
    onSave({
      ...group!,
      name: values.name,
      contacts: availableContacts.filter((contact) =>
        values.contactIds.includes(contact.id),
      ),
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    reset(toFormValues(group!));
    setIsEditing(false);
  }

  function handleDelete() {
    setIsEditing(false);
    onDelete(group!);
  }

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
                <FormTextField
                  control={control}
                  name="name"
                  label="groupName"
                  autoCapitalize="words"
                  colors={colors}
                  t={t}
                />

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
                  {membersError ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={styles.errorText}
                    >
                      {membersError}
                    </Text>
                  ) : null}
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
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {isEditing ? (
              <>
                <ActionButton
                  label={t('cancel')}
                  onPress={handleCancelEdit}
                  variant="secondary"
                  styles={styles}
                />
                {/* Save stays pressable so `handleSubmit` can surface the
                    errors — emptying the member list has no blur event to
                    trigger `onTouched` validation. */}
                <ActionButton
                  label={t('save')}
                  onPress={handleSubmit(handleSave)}
                  variant="primary"
                  styles={styles}
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
            selectedIds={selectedIds}
            colors={colors}
            t={t}
            onCancel={() => setMembersVisible(false)}
            onSave={(ids) => {
              contactIds.onChange(ids);
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
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.danger,
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
