import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateFooter } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { MOCK_CONTACTS } from '../../data/contacts';
import { MOCK_GROUPS } from '../../data/groups';
import { CreateGroupModal } from '../../components/_MyGroups';
import type {
  TColorTokens,
  TGroup,
  TTranslate,
} from '../../types/common.types';

function memberPreview(group: TGroup) {
  return group.contacts.map((contact) => contact.firstName).join(', ');
}

function calledTimesLabel(group: TGroup, t: TTranslate) {
  return t('calledTimes', {
    count: group.timesCalled,
    times: group.timesCalled === 1 ? t('time') : t('times'),
  });
}

function groupAccessibilityLabel(group: TGroup, t: TTranslate) {
  return `${group.name}. ${memberPreview(group)}. ${calledTimesLabel(group, t)}`;
}

export default function GroupsScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [groups, setGroups] = useState<TGroup[]>(() => [...MOCK_GROUPS]);
  const [createVisible, setCreateVisible] = useState(false);

  function handleCreate(group: TGroup) {
    setGroups((current) => [...current, group]);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === groups.length - 1;

          return (
            <View
              accessible
              accessibilityLabel={groupAccessibilityLabel(item, t)}
              style={[styles.row, !isLast && styles.rowDivider]}
            >
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.contacts.length}</Text>
              </View>
              <Text style={styles.members} numberOfLines={1}>
                {memberPreview(item)}
              </Text>
              <Text style={styles.meta}>{calledTimesLabel(item, t)}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noGroups')}</Text>
        }
      />

      <CreateFooter
        label={t('createGroup')}
        onPress={() => setCreateVisible(true)}
        colors={colors}
      />

      <CreateGroupModal
        visible={createVisible}
        availableContacts={MOCK_CONTACTS}
        colors={colors}
        t={t}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 16,
    },
    row: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      marginRight: 12,
      color: colors.text,
    },
    count: {
      overflow: 'hidden',
      minWidth: 28,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '800',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      color: colors.onAccent,
      backgroundColor: colors.accent,
    },
    members: {
      fontSize: 14,
      marginBottom: 4,
      color: colors.accentMuted,
    },
    meta: {
      fontSize: 13,
      color: colors.textMuted,
    },
    empty: {
      textAlign: 'center',
      marginTop: 48,
      fontSize: 16,
      color: colors.accentMuted,
    },
  });
