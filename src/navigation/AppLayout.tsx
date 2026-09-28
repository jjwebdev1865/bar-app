import { StatusBar } from 'expo-status-bar';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  ErrorBoundary,
  IdleTimeoutBoundary,
  Toast,
} from '../components/common';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { useAuthStore } from '../stores/authStore';
import { EThemeModeOptions } from '../theme/theme';
import type { TColorTokens } from '../types/common.types';
import { EDrawerScreen } from '../types/navigation.types';
import { createHeaderOptions } from './headerOptions';

interface IDrawerMenuProps extends DrawerContentComponentProps {}

/**
 * Keeps the sign-out row clear of the home indicator. `DrawerContentScrollView`
 * applies the bottom inset to its own content, but this row sits outside it.
 */
const getDrawerFooterStyle = (bottomInset: number) => ({
  paddingBottom: bottomInset + 12,
});

function DrawerMenu(props: IDrawerMenuProps) {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const isSignedIn = useAuthStore((state) => state.user !== null);
  const signOut = useAuthStore((state) => state.signOut);

  function handleSignOut() {
    // Closed first: signing out swaps the drawer's screens for the login route,
    // and an open drawer would otherwise be left hanging over it with an empty
    // item list. This is the one place that has to, since the sign-out is not
    // itself a navigation action the drawer would close for.
    props.navigation.closeDrawer();
    signOut();
  }

  return (
    // The scroll view and the footer are siblings so the row stays pinned to the
    // bottom of the drawer rather than following the end of the item list.
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} style={styles.drawerScroll}>
        <Text style={styles.brand}>{t('appName')}</Text>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/*
        This component still renders while signed out, when login is the only
        screen. The drawer is unreachable there — no toggle, no swipe — but a
        sign-out row with nobody to sign out is nonsense either way.
      */}
      {isSignedIn ? (
        <View style={[styles.drawerFooter, getDrawerFooterStyle(insets.bottom)]}>
          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutItem,
              pressed && styles.signOutItemPressed,
            ]}
          >
            <Text style={styles.signOutLabel}>{t('signOut')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function AppDrawer() {
  const { colors, themeMode, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerOptions = useMemo(() => createHeaderOptions(colors), [colors]);
  // Derived rather than stored, so it can never disagree with `user`. The
  // selector returns a boolean, which compares cleanly without `useShallow`.
  const isSignedIn = useAuthStore((state) => state.user !== null);

  return (
    <>
      <StatusBar
        style={themeMode === EThemeModeOptions.DARK ? 'light' : 'dark'}
      />
      <Drawer
        drawerContent={DrawerMenu}
        screenOptions={{
          ...headerOptions,
          headerLeft: () => <DrawerToggleButton tintColor={colors.accent} />,
          drawerStyle: styles.drawer,
          drawerActiveTintColor: colors.onAccent,
          drawerActiveBackgroundColor: colors.accent,
          drawerInactiveTintColor: colors.accentMuted,
          drawerLabelStyle: styles.drawerLabel,
          overlayColor: colors.overlay,
          sceneStyle: styles.scene,
        }}
      >
        {/*
          The whole authenticated app. When `isSignedIn` goes false these
          screens stop existing, expo-router falls back to the only screen left
          (login) and drops their history entries — so signing out cannot be
          undone with the back button, and a deep link to `/contacts` while
          signed out lands on login rather than on a half-rendered screen.

          This is client-side routing, not access control. It decides what
          renders, and nothing more; the real check belongs on the server that
          step 04 introduces.
        */}
        <Drawer.Protected guard={isSignedIn}>
          <Drawer.Screen
            name={EDrawerScreen.HOME}
            options={{
              title: t('appName'),
              drawerLabel: t('navHome'),
              headerTransparent: true,
              headerTitle: '',
            }}
          />
          <Drawer.Screen
            name={EDrawerScreen.CONTACTS}
            options={{
              title: t('navContacts'),
              drawerLabel: t('navContacts'),
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name={EDrawerScreen.GROUPS}
            options={{
              title: t('navGroups'),
              drawerLabel: t('navGroups'),
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name={EDrawerScreen.LOCATIONS}
            options={{
              title: t('navLocations'),
              drawerLabel: t('navLocations'),
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name={EDrawerScreen.SETTINGS}
            options={{
              title: t('navSettings'),
              drawerLabel: t('navSettings'),
            }}
          />
        </Drawer.Protected>

        {/*
          The inverse guard, so the two sets are never both present. Signing in
          removes this screen, which is what sends the user to the drawer's
          anchor route (Home) — no `router` call at the submit site.

          The three options survive the guard because being unreachable from
          the menu is not the same as being absent: while signed out this is the
          *only* screen, and it must not offer a hamburger, a menu item or an
          edge swipe into an app the user has not entered.
        */}
        <Drawer.Protected guard={!isSignedIn}>
          <Drawer.Screen
            name={EDrawerScreen.LOGIN}
            options={{
              title: t('signIn'),
              drawerItemStyle: styles.hiddenDrawerItem,
              headerShown: false,
              swipeEnabled: false,
            }}
          />
        </Drawer.Protected>
      </Drawer>

      <Toast colors={colors} t={t} />
    </>
  );
}

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={rootStyles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <SettingsProvider>
            {/*
              Wraps the drawer rather than sitting inside it: the touch listener
              has to be above every screen, and the countdown has to outlive any
              one of them.
            */}
            <IdleTimeoutBoundary>
              <AppDrawer />
            </IdleTimeoutBoundary>
          </SettingsProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

// Rendered above SettingsProvider, so no theme colors are available here.
// Named `rootStyles` because the themed `styles` name is taken per-component.
const rootStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    drawerContainer: {
      flex: 1,
      backgroundColor: colors.panel,
    },
    drawerScroll: {
      backgroundColor: colors.panel,
    },
    drawerFooter: {
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 10,
      paddingTop: 12,
      borderTopColor: colors.border,
    },
    // Geometry matched to a drawer item so the row reads as one more entry in
    // the menu, rather than a button that happens to be nearby.
    signOutItem: {
      minHeight: 48,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    signOutItemPressed: {
      opacity: 0.7,
    },
    signOutLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.danger,
    },
    brand: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
      color: colors.accent,
    },
    drawer: {
      backgroundColor: colors.panel,
      width: '70%',
      maxWidth: 280,
    },
    drawerLabel: {
      fontWeight: '700',
      fontSize: 16,
    },
    hiddenDrawerItem: {
      display: 'none',
    },
    scene: {
      backgroundColor: colors.background,
    },
  });
