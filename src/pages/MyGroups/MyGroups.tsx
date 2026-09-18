import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateFooter } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useGroupsStore } from '../../stores/groupsStore';
import { GroupDetailModal } from '../../components/MyGroups';
import type { TColorTokens, TGroup } from '../../types/common.types';
import { ENestedRoute } from '../../types/navigation.types';

function memberPreview(group: TGroup) {
  return group.contacts.map((contact) => contact.firstName).join(', ');
}

function groupAccessibilityLabel(group: TGroup) {
  return `${group.name}. ${memberPreview(group)}`;
}

export default function GroupsScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const groups = useGroupsStore((state) => state.groups);
  const updateGroup = useGroupsStore((state) => state.updateGroup);
  const removeGroup = useGroupsStore((state) => state.removeGroup);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null;

  function handleDelete(group: TGroup) {
    removeGroup(group.id);
    setSelectedGroupId(null);
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={groupAccessibilityLabel(item)}
              onPress={() => setSelectedGroupId(item.id)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
                !isLast && styles.rowDivider,
              ]}
            >
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.contacts.length}</Text>
              </View>
              <Text style={styles.members} numberOfLines={1}>
                {memberPreview(item)}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noGroups')}</Text>
        }
      />

      <CreateFooter
        label={t('createGroup')}
        onPress={() => router.push(ENestedRoute.CREATE_GROUP)}
        colors={colors}
      />

      <GroupDetailModal
        group={selectedGroup}
        visible={selectedGroup !== null}
        colors={colors}
        t={t}
        onClose={() => setSelectedGroupId(null)}
        onSave={updateGroup}
        onDelete={handleDelete}
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
    rowPressed: {
      opacity: 0.7,
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
    empty: {
      textAlign: 'center',
      marginTop: 48,
      fontSize: 16,
      color: colors.accentMuted,
    },
  });
