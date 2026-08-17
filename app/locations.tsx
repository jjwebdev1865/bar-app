import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useSettings } from '../context/SettingsContext';
import { mockContacts } from '../src/data/contacts';
import { mockLocations, type BarLocation } from '../src/data/locations';

function favoriteCount(location: BarLocation) {
  return mockContacts.filter(
    (contact) => contact.favoriteBarId === location.id,
  ).length;
}

export default function LocationsScreen() {
  const { colors, t } = useSettings();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={mockLocations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === mockLocations.length - 1;
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
    </View>
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
