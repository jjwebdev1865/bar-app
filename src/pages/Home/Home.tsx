import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';

import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useContactsStore } from '../../stores/contactsStore';
import { useGroupsStore } from '../../stores/groupsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import { Dropdown } from '../../components/common';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { formatElapsedTime } from '../../utils/timeFormat';
import type { TColorTokens } from '../../types';
import {
  EAppRoute,
  ENestedRoute,
  RETURN_TO_PARAM,
} from '../../constants/routes';
import {
  ActiveSignal,
  BarStool,
  CancelSignalModal,
} from '../../components/_Home';

export default function HomeScreen() {
  const { colors, t } = useSettings();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const styles = useMemo(
    () => createStyles(colors, headerHeight),
    [colors, headerHeight],
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [openDropdown, setOpenDropdown] = useState<'group' | 'location' | null>(
    null,
  );
  const {
    elapsedSeconds,
    isActive: signalActive,
    start,
    reset,
  } = useElapsedTimer();
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);

  const contacts = useContactsStore((state) => state.contacts);
  const groups = useGroupsStore((state) => state.groups);
  const locations = useLocationsStore((state) => state.locations);
  const hasContacts = contacts.length > 0;

  const groupOptions = useMemo(
    () => groups.map((group) => ({ value: group.id, label: group.name })),
    [groups],
  );

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [locations],
  );

  // Resolve against the stores rather than trusting the local ids — a group or
  // location deleted on its own screen must not linger as a stale selection here.
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null;
  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null;

  function activateSignal() {
    if (signalActive) {
      return;
    }

    console.log('Bar Signal Activated');
    setOpenDropdown(null);
    start();
  }

  function addFirstContact() {
    // `withAnchor` because this crosses into the contacts stack from outside
    // it. A bare push builds that stack as `[new]` alone, which leaves nothing
    // to unwind: the form stays mounted, still filled in, and opening Contacts
    // from the drawer later lands on it instead of on the list.
    //
    // `returnTo` because the bottle is a Home affordance. The user came from
    // Home to add the contact that turns it into the stool, so that is where
    // saving it puts them back — not on the contacts list this form lives in.
    router.push(
      {
        pathname: ENestedRoute.CREATE_CONTACT,
        params: { [RETURN_TO_PARAM]: EAppRoute.HOME },
      },
      { withAnchor: true },
    );
  }

  function requestCancelSignal() {
    setConfirmCancelVisible(true);
  }

  function dismissCancelConfirmation() {
    setConfirmCancelVisible(false);
  }

  function confirmCancelSignal() {
    setConfirmCancelVisible(false);
    reset();
  }

  const elapsedLabel = formatElapsedTime(elapsedSeconds, t);

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>{t('welcomeTo')}</Text>
        <Text style={styles.title}>{t('appName')}</Text>
      </View>

      <View style={styles.content}>
        {signalActive ? (
          <ActiveSignal
            requestCancelSignal={requestCancelSignal}
            selectedGroup={selectedGroup}
            selectedLocation={selectedLocation}
            colors={colors}
            elapsedLabel={elapsedLabel}
            t={t}
          />
        ) : (
          <>
            <BarStool
              activateSignal={activateSignal}
              addFirstContact={addFirstContact}
              t={t}
              colors={colors}
              contactsReady={hasContacts}
            />

            {hasContacts ? (
              <View style={styles.selectors}>
                <Dropdown
                  label={t('selectGroup')}
                  placeholder={t('chooseGroup')}
                  options={groupOptions}
                  value={selectedGroup?.id ?? null}
                  open={openDropdown === 'group'}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? 'group' : null)
                  }
                  onChange={setSelectedGroupId}
                  colors={colors}
                />

                <Dropdown
                  label={t('selectLocation')}
                  placeholder={t('chooseLocation')}
                  options={locationOptions}
                  value={selectedLocation?.id ?? null}
                  open={openDropdown === 'location'}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? 'location' : null)
                  }
                  onChange={setSelectedLocationId}
                  colors={colors}
                />
              </View>
            ) : (
              <Text style={styles.noContactsHint}>
                {t('homeNoContactsHint')}
              </Text>
            )}
          </>
        )}
      </View>

      <CancelSignalModal
        visible={confirmCancelVisible}
        onDismiss={dismissCancelConfirmation}
        onConfirm={confirmCancelSignal}
        colors={colors}
        t={t}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens, headerHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    // Home's drawer header is transparent, so the screen renders behind it —
    // offset by its height to keep the heading clear of the hamburger button.
    header: {
      width: '100%',
      alignItems: 'center',
      paddingTop: headerHeight + 8,
    },
    content: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcome: {
      fontSize: 18,
      letterSpacing: 4,
      textTransform: 'uppercase',
      marginBottom: 8,
      color: colors.accentMuted,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
      color: colors.accent,
    },
    selectors: {
      width: '100%',
      maxWidth: 360,
      gap: 16,
      marginTop: 36,
      zIndex: 1,
    },
    noContactsHint: {
      width: '100%',
      maxWidth: 360,
      marginTop: 36,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textMuted,
    },
  });
