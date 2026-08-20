import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateFooter } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { MOCK_CONTACTS } from '../../data/contacts';
import { MOCK_LOCATIONS } from '../../data/locations';
import { CreateLocationModal } from '../../components/_MyLocations';
import type { TBarLocation, TColorTokens } from '../../types/common.types';

function favoriteCount(location: TBarLocation) {
  return MOCK_CONTACTS.filter(
    (contact) => contact.favoriteBarId === location.id,
  ).length;
}

export default function LocationsScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [locations, setLocations] = useState<TBarLocation[]>(() => [
    ...MOCK_LOCATIONS,
  ]);
  const [createVisible, setCreateVisible] = useState(false);

  function handleCreate(location: TBarLocation) {
    setLocations((current) => [...current, location]);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLast = index === locations.length - 1;
          const fans = favoriteCount(item);

          return (
            <View style={[styles.row, !isLast && styles.rowDivider]}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.coords}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
              <Text style={styles.meta}>
                {t('favoriteOf', {
                  count: fans,
                  contacts: fans === 1 ? t('contact') : t('contacts'),
                })}
              </Text>
            </View>
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
      paddingBottom: 24,
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
