import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { CreateFooter } from "../../components/common";
import { useSettings } from "../../../context/SettingsContext";
import { mockContacts } from "../../data/contacts";
import { mockGroups, type Group } from "../../data/groups";
import { CreateGroupModal } from "../../components/_MyGroups";

function memberPreview(group: Group) {
  return group.contacts.map((contact) => contact.firstName).join(", ");
}

export default function GroupsScreen() {
  const { colors, t } = useSettings();
  const [groups, setGroups] = useState<Group[]>(() => [...mockGroups]);
  const [createVisible, setCreateVisible] = useState(false);

  function handleCreate(group: Group) {
    setGroups((current) => [...current, group]);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === groups.length - 1;

          return (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.background },
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.rowTop}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.count,
                    {
                      color: colors.onAccent,
                      backgroundColor: colors.accent,
                    },
                  ]}
                >
                  {item.contacts.length}
                </Text>
              </View>
              <Text
                style={[styles.members, { color: colors.accentMuted }]}
                numberOfLines={1}
              >
                {memberPreview(item)}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {t("calledTimes", {
                  count: item.timesCalled,
                  times: item.timesCalled === 1 ? t("time") : t("times"),
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.accentMuted }]}>
            {t("noGroups")}
          </Text>
        }
      />

      <CreateFooter
        label={t("createGroup")}
        onPress={() => setCreateVisible(true)}
        colors={colors}
      />

      <CreateGroupModal
        visible={createVisible}
        availableContacts={mockContacts}
        colors={colors}
        t={t}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  count: {
    overflow: "hidden",
    minWidth: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  members: {
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
  },
  empty: {
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
  },
});
