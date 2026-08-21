import { StatusBar } from 'expo-status-bar';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '../components/common';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { EThemeModeOptions } from '../theme/theme';
import type { TColorTokens } from '../types/common.types';
import { EDrawerScreen } from '../types/navigation.types';

interface IDrawerMenuProps extends DrawerContentComponentProps {}

function DrawerMenu(props: IDrawerMenuProps) {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <DrawerContentScrollView {...props} style={styles.drawerScroll}>
      <Text style={styles.brand}>{t('appName')}</Text>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  const { colors, themeMode, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <StatusBar
        style={themeMode === EThemeModeOptions.DARK ? 'light' : 'dark'}
      />
      <Drawer
        drawerContent={DrawerMenu}
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: colors.accent,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
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
          }}
        />
        <Drawer.Screen
          name={EDrawerScreen.GROUPS}
          options={{
            title: t('navGroups'),
            drawerLabel: t('navGroups'),
          }}
        />
        <Drawer.Screen
          name={EDrawerScreen.LOCATIONS}
          options={{
            title: t('navLocations'),
            drawerLabel: t('navLocations'),
          }}
        />
        <Drawer.Screen
          name={EDrawerScreen.SETTINGS}
          options={{
            title: t('navSettings'),
            drawerLabel: t('navSettings'),
          }}
        />
      </Drawer>
    </>
  );
}

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={rootStyles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <SettingsProvider>
            <AppDrawer />
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
    drawerScroll: {
      backgroundColor: colors.panel,
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
    header: {
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.accent,
      fontWeight: '800',
    },
    drawer: {
      backgroundColor: colors.panel,
    },
    drawerLabel: {
      fontWeight: '700',
      fontSize: 16,
    },
    scene: {
      backgroundColor: colors.background,
    },
  });
