import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import { formatAddressLines } from '../../utils/addressFormat';
import { formatPhoneDisplay } from '../../utils/phoneFormat';
import type { TColorTokens } from '../../types';

export default function ProfileScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // This screen only exists inside `AppLayout`'s signed-in guard, so `user` is
  // never null while it renders. Selected defensively anyway, same as Settings.
  const firstName = useAuthStore((state) => state.user?.firstName ?? '');
  const lastName = useAuthStore((state) => state.user?.lastName ?? '');
  const username = useAuthStore((state) => state.user?.username ?? '');
  // Only the `MOCK_USERS` fixtures set these today (see `TNamedCredentials`)
  // — `CreateAccount` doesn't collect either, so a created account still
  // falls back to "N/A" here.
  const email = useAuthStore((state) => state.user?.email ?? '');
  const phone = useAuthStore((state) => state.user?.phone ?? '');
  // Same reasoning as email/phone — no sign-in path sets this yet, so the
  // "add address" button below is what every account sees today.
  const address = useAuthStore((state) => state.user?.address);
  const fullName = `${firstName} ${lastName}`.trim();
  const notAvailable = t('notAvailable');
  const emailDisplay = email || notAvailable;
  const phoneDisplay = phone ? formatPhoneDisplay(phone) : notAvailable;
  const addressDisplay = address ? formatAddressLines(address) : '';

  function handleAddAddressPress() {
    // Placeholder: no edit flow exists yet, so pressing this just proves the
    // button is wired up until one does.
    console.log('[Profile] Add address pressed');
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <View
        style={styles.card}
        accessibilityLabel={`${t('profileName')}: ${fullName}, ${t('profileUsername')}: ${username}, ${t('profileEmail')}: ${emailDisplay}, ${t('profilePhone')}: ${phoneDisplay}`}
      >
        <Text style={styles.sectionTitle}>{t('bio')}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profileName')}</Text>
          <Text style={styles.rowValue}>{fullName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profileUsername')}</Text>
          <Text style={styles.rowValue}>{username}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profileEmail')}</Text>
          <Text style={styles.rowValue}>{emailDisplay}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profilePhone')}</Text>
          <Text style={styles.rowValue}>{phoneDisplay}</Text>
        </View>
        <Text style={styles.hint}>{t('profileHint')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('profileAddress')}</Text>
        {addressDisplay ? (
          <Text style={styles.addressText}>{addressDisplay}</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleAddAddressPress}
            style={({ pressed }) => [
              styles.addAddressButton,
              pressed && styles.addAddressButtonPressed,
            ]}
          >
            <Text style={styles.addAddressLabel}>{t('addAddress')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
      backgroundColor: colors.background,
    },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: colors.accent,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
    rowValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    addressText: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      color: colors.text,
    },
    addAddressButton: {
      minHeight: 44,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderColor: colors.accent,
      backgroundColor: colors.background,
    },
    addAddressButtonPressed: {
      opacity: 0.8,
    },
    addAddressLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.accent,
    },
  });
