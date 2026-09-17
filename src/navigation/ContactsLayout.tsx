import { Stack } from 'expo-router';
import { DrawerToggleButton } from 'expo-router/drawer';
import { useMemo } from 'react';

import { useSettings } from '../context/SettingsContext';
import { EContactsScreen } from '../types/navigation.types';
import { createHeaderOptions } from './headerOptions';

/**
 * Stack nested under the drawer's Contacts section, so the create form can be
 * pushed as a full screen instead of rendered in a dialog.
 *
 * The drawer hides its own header for this section (`AppLayout`), which is what
 * keeps a single header on screen — this stack renders it instead, and the list
 * screen carries the drawer toggle that the drawer header would have provided.
 */
export default function ContactsLayout() {
  const { colors, t } = useSettings();
  const headerOptions = useMemo(() => createHeaderOptions(colors), [colors]);

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name={EContactsScreen.LIST}
        options={{
          title: t('navContacts'),
          headerLeft: () => <DrawerToggleButton tintColor={colors.accent} />,
        }}
      />
      <Stack.Screen
        name={EContactsScreen.NEW}
        options={{ title: t('createContact') }}
      />
    </Stack>
  );
}
