import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { useSettings } from "../../context/SettingsContext";
import { mockContacts, type Contact } from "../../data/contacts";
import { CreateFooter } from "../../components/common";
import { ContactDetailModal, CreateContactModal } from "../../components/_MyContacts";

type ContactSection = {
  title: string;
  data: Contact[];
};

function sortKey(contact: Contact) {
  return `${contact.lastName} ${contact.firstName}`.toLowerCase();
}

function displayName(contact: Contact) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

function buildSections(contacts: Contact[]): ContactSection[] {
  const sorted = [...contacts].sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b)),
  );

  const sections: ContactSection[] = [];

  for (const contact of sorted) {
    const letter = contact.lastName[0]?.toUpperCase() ?? "#";
    const last = sections[sections.length - 1];

    if (last?.title === letter) {
      last.data.push(contact);
    } else {
      sections.push({ title: letter, data: [contact] });
    }
  }

  return sections;
}

export default function ContactsScreen() {
  const { colors, t } = useSettings();
  const [contacts, setContacts] = useState<Contact[]>(() => [...mockContacts]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [createVisible, setCreateVisible] = useState(false);

  const sections = useMemo(() => buildSections(contacts), [contacts]);
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? null;

  function handleSave(updatedContact: Contact) {
    setContacts((current) =>
      current.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact,
      ),
    );
  }

  function handleCreate(contact: Contact) {
    setContacts((current) => [...current, contact]);
  }

  function handleDelete(contact: Contact) {
    setSelectedContactId(null);
    // Local list update is deferred until delete persistence exists.
    void contact;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View
            style={[styles.sectionHeader, { backgroundColor: colors.panel }]}
          >
            <Text style={[styles.sectionLetter, { color: colors.accent }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1;

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedContactId(item.id)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: colors.background,
                  opacity: pressed ? 0.7 : 1,
                },
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.name, { color: colors.text }]}>
                {displayName(item)}
              </Text>
              <Text style={[styles.phone, { color: colors.accentMuted }]}>
                {item.phone}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.accentMuted }]}>
            {t("noContacts")}
          </Text>
        }
      />

      <CreateFooter
        label={t("createContact")}
        onPress={() => setCreateVisible(true)}
        colors={colors}
      />

      <CreateContactModal
        visible={createVisible}
        colors={colors}
        t={t}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />

      <ContactDetailModal
        contact={selectedContact}
        visible={selectedContact !== null}
        colors={colors}
        t={t}
        onClose={() => setSelectedContactId(null)}
        onSave={handleSave}
        onDelete={handleDelete}
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  sectionLetter: {
    fontSize: 16,
    fontWeight: "800",
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
  },
});
