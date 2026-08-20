import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { MOCK_CONTACTS } from '../../data/contacts';
import { CreateFooter } from '../../components/common';
import {
  ContactDetailModal,
  CreateContactModal,
} from '../../components/_MyContacts';
import type { TColorTokens, TContact } from '../../types/common.types';
import type { TContactSection } from '../../types/MyContacts.types';
import { formatContactDisplayName } from '../../utils/contactFormat';

function sortKey(contact: TContact) {
  return `${contact.lastName} ${contact.firstName}`.toLowerCase();
}

function buildSections(contacts: TContact[]): TContactSection[] {
  const sorted = [...contacts].sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b)),
  );

  const sections: TContactSection[] = [];

  for (const contact of sorted) {
    const letter = contact.lastName[0]?.toUpperCase() ?? '#';
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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [contacts, setContacts] = useState<TContact[]>(() => [...MOCK_CONTACTS]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [createVisible, setCreateVisible] = useState(false);

  const sections = useMemo(() => buildSections(contacts), [contacts]);
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? null;

  function handleSave(updatedContact: TContact) {
    setContacts((current) =>
      current.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact,
      ),
    );
  }

  function handleCreate(contact: TContact) {
    setContacts((current) => [...current, contact]);
  }

  function handleDelete(contact: TContact) {
    setSelectedContactId(null);
    // Local list update is deferred until delete persistence exists.
    void contact;
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>{section.title}</Text>
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
                pressed && styles.rowPressed,
                !isLast && styles.rowDivider,
              ]}
            >
              <Text style={styles.name}>{formatContactDisplayName(item)}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noContacts')}</Text>
        }
      />

      <CreateFooter
        label={t('createContact')}
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
    sectionHeader: {
      paddingHorizontal: 20,
      paddingVertical: 6,
      backgroundColor: colors.panel,
    },
    sectionLetter: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.accent,
    },
    row: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.background,
    },
    rowPressed: {
      opacity: 0.7,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    name: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    phone: {
      fontSize: 14,
      color: colors.accentMuted,
    },
    empty: {
      textAlign: 'center',
      marginTop: 48,
      fontSize: 16,
      color: colors.accentMuted,
    },
  });
