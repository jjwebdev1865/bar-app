import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from 'expo-router/react-navigation';

import { useSettings } from '../../context/SettingsContext';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { MOCK_GROUPS } from '../../data/groups';
import { MOCK_LOCATIONS } from '../../data/locations';
import { Dropdown } from '../../components/common';
import type {
  TColorTokens,
  TContact,
  TTranslate,
} from '../../types/common.types';

const SIGNAL_SIZE = 220;

type THomeStyles = ReturnType<typeof createStyles>;

interface IBarStoolProps {
  styles: THomeStyles;
}

function formatElapsedTime(totalSeconds: number, t: TTranslate) {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? t('second') : t('seconds')}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteLabel = `${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;

  if (seconds === 0) {
    return minuteLabel;
  }

  return `${minuteLabel} ${seconds} ${seconds === 1 ? t('second') : t('seconds')}`;
}

function contactDisplayName(contact: TContact) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

function BarStool({ styles }: IBarStoolProps) {
  return (
    <View style={styles.stool}>
      <View style={styles.seatTop} />
      <View style={styles.seat} />
      <View style={styles.pole} />
      <View style={styles.footrest} />
      <View style={styles.base} />
    </View>
  );
}

export default function HomeScreen() {
  const { colors, t } = useSettings();
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
  const [signalActive, setSignalActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);

  const groupOptions = useMemo(
    () => MOCK_GROUPS.map((group) => ({ value: group.id, label: group.name })),
    [],
  );

  const locationOptions = useMemo(
    () =>
      MOCK_LOCATIONS.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [],
  );

  const selectedGroup = MOCK_GROUPS.find(
    (group) => group.id === selectedGroupId,
  );
  const selectedLocation = MOCK_LOCATIONS.find(
    (location) => location.id === selectedLocationId,
  );

  useEffect(() => {
    if (!signalActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [signalActive]);

  function activateSignal() {
    if (signalActive) {
      return;
    }

    console.log('Bar Signal Activated');
    setOpenDropdown(null);
    setElapsedSeconds(0);
    setSignalActive(true);
  }

  function requestCancelSignal() {
    setConfirmCancelVisible(true);
  }

  function dismissCancelConfirmation() {
    setConfirmCancelVisible(false);
  }

  function confirmCancelSignal() {
    setConfirmCancelVisible(false);
    setSignalActive(false);
    setElapsedSeconds(0);
  }

  const headingToLabel =
    selectedGroup && selectedLocation
      ? t('headingTo', {
          group: selectedGroup.name,
          location: selectedLocation.name,
        })
      : null;

  const elapsedLabel = formatElapsedTime(elapsedSeconds, t);
  const timerAccessibilityLabel = [
    headingToLabel,
    `${t('travelTimer')}: ${elapsedLabel}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>{t('welcomeTo')}</Text>
        <Text style={styles.title}>{t('appName')}</Text>
      </View>

      <View style={styles.content}>
        {signalActive ? (
          <View style={styles.activeSignal}>
            <View
              accessible
              accessibilityLabel={timerAccessibilityLabel}
              style={styles.timerBlock}
            >
              {headingToLabel ? (
                <Text style={styles.headingTo}>{headingToLabel}</Text>
              ) : null}
              <Text style={styles.timerLabel}>{t('travelTimer')}</Text>
              <Text style={styles.timerValue}>{elapsedLabel}</Text>
            </View>

            {selectedGroup ? (
              <View style={styles.membersCard}>
                <Text style={styles.membersTitle}>{t('whoIsComing')}</Text>
                <ScrollView
                  style={styles.membersList}
                  contentContainerStyle={styles.membersListContent}
                >
                  {selectedGroup.contacts.map((contact, index) => {
                    const isLast = index === selectedGroup.contacts.length - 1;
                    const memberLabel = `${contactDisplayName(contact)}: ${t(
                      'onTheWay',
                    )}`;

                    return (
                      <View
                        key={contact.id}
                        accessible
                        accessibilityLabel={memberLabel}
                        style={[
                          styles.memberRow,
                          !isLast && styles.memberRowDivider,
                        ]}
                      >
                        <Text style={styles.memberName} numberOfLines={1}>
                          {contactDisplayName(contact)}
                        </Text>
                        <Text style={styles.memberStatus}>{t('onTheWay')}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('cancel')}
              onPress={requestCancelSignal}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
            >
              <Text style={styles.cancelLabel}>{t('cancel')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('activateBarSignal')}
              onPress={activateSignal}
              style={({ pressed }) => [
                styles.signalButton,
                pressed && styles.signalButtonPressed,
              ]}
            >
              <BarStool styles={styles} />
            </Pressable>

            <View style={styles.selectors}>
              <Dropdown
                label={t('selectGroup')}
                placeholder={t('chooseGroup')}
                options={groupOptions}
                value={selectedGroupId}
                open={openDropdown === 'group'}
                onOpenChange={(open) => setOpenDropdown(open ? 'group' : null)}
                onChange={setSelectedGroupId}
                colors={colors}
              />

              <Dropdown
                label={t('selectLocation')}
                placeholder={t('chooseLocation')}
                options={locationOptions}
                value={selectedLocationId}
                open={openDropdown === 'location'}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? 'location' : null)
                }
                onChange={setSelectedLocationId}
                colors={colors}
              />
            </View>
          </>
        )}
      </View>

      <Modal
        visible={confirmCancelVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissCancelConfirmation}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('cancelSignalTitle')}</Text>
            <Text style={styles.modalMessage}>{t('cancelSignalMessage')}</Text>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={dismissCancelConfirmation}
                style={({ pressed }) => [
                  styles.modalKeepButton,
                  pressed && styles.modalButtonPressed,
                ]}
              >
                <Text style={styles.modalKeepLabel}>{t('keepSignal')}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={confirmCancelSignal}
                style={({ pressed }) => [
                  styles.modalStopButton,
                  pressed && styles.modalButtonPressed,
                ]}
              >
                <Text style={styles.modalStopLabel}>{t('stopSignal')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens, headerHeight: number) => {
  const modalButton = {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderColor: colors.border,
  } as const;

  const modalButtonLabel = {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  } as const;

  return StyleSheet.create({
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
    activeSignal: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: 20,
    },
    timerBlock: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
    },
    headingTo: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 4,
      color: colors.accentMuted,
    },
    timerLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: colors.accentMuted,
    },
    timerValue: {
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      color: colors.accent,
    },
    membersCard: {
      width: '100%',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      paddingTop: 14,
      paddingBottom: 4,
      maxHeight: 260,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    membersTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      paddingHorizontal: 16,
      marginBottom: 8,
      color: colors.accent,
    },
    membersList: {
      width: '100%',
    },
    membersListContent: {
      paddingBottom: 8,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    memberRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    memberName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    memberStatus: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
    cancelButton: {
      minHeight: 48,
      minWidth: 180,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    cancelButtonPressed: {
      opacity: 0.8,
    },
    cancelLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: colors.overlay,
    },
    modalSheet: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 10,
      color: colors.accent,
    },
    modalMessage: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    modalKeepButton: {
      ...modalButton,
      backgroundColor: colors.background,
    },
    modalStopButton: {
      ...modalButton,
      backgroundColor: colors.danger,
    },
    modalButtonPressed: {
      opacity: 0.8,
    },
    modalKeepLabel: {
      ...modalButtonLabel,
      color: colors.text,
    },
    modalStopLabel: {
      ...modalButtonLabel,
      color: colors.white,
    },
    signalButton: {
      width: SIGNAL_SIZE,
      height: SIGNAL_SIZE,
      borderRadius: SIGNAL_SIZE / 2,
      borderWidth: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.white,
      backgroundColor: colors.accent,
    },
    signalButtonPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },
    stool: {
      width: 88,
      height: 128,
      alignItems: 'center',
    },
    seatTop: {
      width: 64,
      height: 10,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      backgroundColor: colors.stool,
    },
    seat: {
      width: 72,
      height: 14,
      borderRadius: 6,
      marginTop: -2,
      backgroundColor: colors.stool,
    },
    pole: {
      width: 10,
      flex: 1,
      marginTop: -1,
      marginBottom: -1,
      backgroundColor: colors.stool,
    },
    footrest: {
      position: 'absolute',
      top: 70,
      width: 52,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.stool,
    },
    base: {
      width: 64,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.stool,
    },
  });
};
