import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { Dropdown } from '../../components/common';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import { useLocationsStore } from '../../stores/locationsStore';
import { formatAddressLines } from '../../utils/addressFormat';
import { formatPhoneDisplay } from '../../utils/phoneFormat';
import type { TColorTokens } from '../../types';

const MIN_FOOTER_BOTTOM_PADDING = 12;

const getFooterInsetStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset, MIN_FOOTER_BOTTOM_PADDING),
});

export default function ProfileScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
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
  const favoriteBarId = useAuthStore((state) => state.user?.favoriteBarId ?? '');
  const setFavoriteBar = useAuthStore((state) => state.setFavoriteBar);
  const favoriteDrink = useAuthStore((state) => state.user?.favoriteDrink ?? '');
  const setFavoriteDrink = useAuthStore((state) => state.setFavoriteDrink);
  const favoriteShot = useAuthStore((state) => state.user?.favoriteShot ?? '');
  const setFavoriteShot = useAuthStore((state) => state.setFavoriteShot);
  const locations = useLocationsStore((state) => state.locations);
  const [favoriteBarOpen, setFavoriteBarOpen] = useState(false);
  // Draft text, committed to `authStore` only on Save — the dropdown's value
  // below is draft state too now, so every Favorites field commits together.
  // Initial state reads the store once; this screen remounts on sign-in/out
  // (it lives behind `AppLayout`'s guard), so a fresh draft always starts in
  // sync.
  const [draftFavoriteBarId, setDraftFavoriteBarId] = useState(favoriteBarId);
  const [draftDrink, setDraftDrink] = useState(favoriteDrink);
  const [draftShot, setDraftShot] = useState(favoriteShot);
  const isFavoritesDirty =
    draftFavoriteBarId !== favoriteBarId ||
    draftDrink !== favoriteDrink ||
    draftShot !== favoriteShot;
  const fullName = `${firstName} ${lastName}`.trim();
  const notAvailable = t('notAvailable');
  const emailDisplay = email || notAvailable;
  const phoneDisplay = phone ? formatPhoneDisplay(phone) : notAvailable;
  const addressDisplay = address ? formatAddressLines(address) : '';
  const favoriteBarOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [locations],
  );

  function handleAddAddressPress() {
    // Placeholder: no edit flow exists yet, so pressing this just proves the
    // button is wired up until one does.
    console.log('[Profile] Add address pressed');
  }

  function handleSaveFavorites() {
    setFavoriteBar(draftFavoriteBarId);
    setFavoriteDrink(draftDrink);
    setFavoriteShot(draftShot);
  }

  function handleResetFavorites() {
    setDraftFavoriteBarId(favoriteBarId);
    setDraftDrink(favoriteDrink);
    setDraftShot(favoriteShot);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('profileFavorites')}</Text>
          <Dropdown
            label={t('favoriteBar')}
            placeholder={t('chooseLocation')}
            options={favoriteBarOptions}
            value={draftFavoriteBarId || null}
            open={favoriteBarOpen}
            onOpenChange={setFavoriteBarOpen}
            onChange={setDraftFavoriteBarId}
            colors={colors}
          />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('favoriteDrink')}</Text>
            <TextInput
              accessibilityLabel={t('favoriteDrink')}
              value={draftDrink}
              onChangeText={setDraftDrink}
              placeholderTextColor={colors.textMuted}
              style={styles.textInput}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('favoriteShot')}</Text>
            <TextInput
              accessibilityLabel={t('favoriteShot')}
              value={draftShot}
              onChangeText={setDraftShot}
              placeholderTextColor={colors.textMuted}
              style={styles.textInput}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, getFooterInsetStyle(insets.bottom)]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFavoritesDirty }}
          disabled={!isFavoritesDirty}
          onPress={handleResetFavorites}
          style={({ pressed }) => [
            styles.resetButton,
            !isFavoritesDirty && styles.footerButtonDisabled,
            pressed && styles.addAddressButtonPressed,
          ]}
        >
          <Text style={styles.resetLabel}>{t('reset')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFavoritesDirty }}
          disabled={!isFavoritesDirty}
          onPress={handleSaveFavorites}
          style={({ pressed }) => [
            styles.saveButton,
            !isFavoritesDirty && styles.footerButtonDisabled,
            pressed && styles.addAddressButtonPressed,
          ]}
        >
          <Text style={styles.saveLabel}>{t('save')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 16,
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
    field: {
      gap: 6,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: colors.accent,
    },
    textInput: {
      minHeight: 44,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      borderTopWidth: 4,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopColor: colors.textMuted,
    },
    resetButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderColor: colors.border,
      backgroundColor: colors.panel,
    },
    resetLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textMuted,
    },
    saveButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: colors.accent,
    },
    saveLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onAccent,
    },
    footerButtonDisabled: {
      opacity: 0.4,
    },
  });
