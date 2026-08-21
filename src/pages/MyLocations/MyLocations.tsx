import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateFooter } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useContactsStore } from '../../stores/contactsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import {
  CreateLocationModal,
  LocationDetailModal,
} from '../../components/_MyLocations';
import type {
  TBarLocation,
  TColorTokens,
  TTranslate,
} from '../../types/common.types';
import {
  countFavoriteContacts,
  formatFavoriteOfLabel,
} from '../../utils/locationFormat';

function locationAccessibilityLabel(
  location: TBarLocation,
  fans: number,
  t: TTranslate,
) {
  return `${location.name}. ${location.address}. ${formatFavoriteOfLabel(
    fans,
    t,
  )}`;
}

export default function LocationsScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const contacts = useContactsStore((state) => state.contacts);
  const locations = useLocationsStore((state) => state.locations);
  const addLocation = useLocationsStore((state) => state.addLocation);
  const updateLocation = useLocationsStore((state) => state.updateLocation);
  const removeLocation = useLocationsStore((state) => state.removeLocation);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [createVisible, setCreateVisible] = useState(false);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null;

  function handleDelete(location: TBarLocation) {
    removeLocation(location.id);
    setSelectedLocationId(null);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === locations.length - 1;
          const fans = countFavoriteContacts(item, contacts);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={locationAccessibilityLabel(item, fans, t)}
              onPress={() => setSelectedLocationId(item.id)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
                !isLast && styles.rowDivider,
              ]}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.coords}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
              <Text style={styles.meta}>
                {formatFavoriteOfLabel(fans, t)}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noLocations')}</Text>
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
        onCreate={addLocation}
      />

      <LocationDetailModal
        location={selectedLocation}
        visible={selectedLocation !== null}
        colors={colors}
        t={t}
        onClose={() => setSelectedLocationId(null)}
        onSave={updateLocation}
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
      paddingBottom: 24,
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
    name: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      color: colors.text,
    },
    address: {
      fontSize: 14,
      marginBottom: 4,
      color: colors.accentMuted,
    },
    coords: {
      fontSize: 13,
      marginBottom: 6,
      color: colors.textMuted,
    },
    meta: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accent,
    },
    empty: {
      textAlign: 'center',
      marginTop: 48,
      fontSize: 16,
      color: colors.accentMuted,
    },
  });
