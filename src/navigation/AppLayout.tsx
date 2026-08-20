import { StatusBar } from 'expo-status-bar';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider, useSettings } from '../context/SettingsContext';

function DrawerMenu(props: DrawerContentComponentProps) {
  const { colors, t } = useSettings();

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.panel }}
    >
      <Text style={[styles.brand, { color: colors.accent }]}>{t('appName')}</Text>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  const { colors, themeMode, t } = useSettings();

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Drawer
        drawerContent={DrawerMenu}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.accent, fontWeight: '800' },
          headerShadowVisible: false,
          headerLeft: () => <DrawerToggleButton tintColor={colors.accent} />,
          drawerStyle: { backgroundColor: colors.panel },
          drawerActiveTintColor: colors.onAccent,
          drawerActiveBackgroundColor: colors.accent,
          drawerInactiveTintColor: colors.accentMuted,
          drawerLabelStyle: { fontWeight: '700', fontSize: 16 },
          overlayColor: colors.overlay,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: t('appName'),
            drawerLabel: t('navHome'),
            headerTransparent: true,
            headerTitle: '',
          }}
        />
        <Drawer.Screen
          name="contacts"
          options={{
            title: t('navContacts'),
            drawerLabel: t('navContacts'),
          }}
        />
        <Drawer.Screen
          name="groups"
          options={{
            title: t('navGroups'),
            drawerLabel: t('navGroups'),
          }}
        />
        <Drawer.Screen
          name="locations"
          options={{
            title: t('navLocations'),
            drawerLabel: t('navLocations'),
          }}
        />
        <Drawer.Screen
          name="settings"
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
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AppDrawer />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
});
