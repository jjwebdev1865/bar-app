import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateFooter } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { mockContacts } from '../../data/contacts';
import { mockLocations, type BarLocation } from '../../data/locations';
import { CreateLocationModal } from '../../components/_MyLocations';

function favoriteCount(location: BarLocation) {
  return mockContacts.filter(
    (contact) => contact.favoriteBarId === location.id,
  ).length;
}

export default function LocationsScreen() {
  const { colors, t } = useSettings();
  const [locations, setLocations] = useState<BarLocation[]>(() => [
    ...mockLocations,
  ]);
  const [createVisible, setCreateVisible] = useState(false);

  function handleCreate(location: BarLocation) {
    setLocations((current) => [...current, location]);
  }

  return (
    <SafeAreaView
      edges={HEADER_SCREEN_EDGES}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === locations.length - 1;
          const fans = favoriteCount(item);

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
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.address, { color: colors.accentMuted }]}>
                {item.address}
              </Text>
              <Text style={[styles.coords, { color: colors.textMuted }]}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
              <Text style={[styles.meta, { color: colors.accent }]}>
                {t('favoriteOf', {
                  count: fans,
                  contacts: fans === 1 ? t('contact') : t('contacts'),
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.accentMuted }]}>
            {t('noLocations')}
          </Text>
        }
      />

      <CreateFooter
        label={t('createLocation')}
        onPress={() => setCreateVisible(true)}
        colors={colors}
      />

      <CreateLocationModal
        visible={createVisible}
        colors={colors}
        t={t}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
  },
  coords: {
    fontSize: 13,
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
});
