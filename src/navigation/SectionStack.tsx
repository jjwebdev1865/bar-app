import { Stack } from 'expo-router';
import { DrawerToggleButton } from 'expo-router/drawer';
import { useMemo } from 'react';

import { useSettings } from '../context/SettingsContext';
import type { TTranslationKey } from '../types/common.types';
import { ESectionScreen } from '../types/navigation.types';
import { createHeaderOptions } from './headerOptions';

interface ISectionStackProps {
  /** Header title for the section's list screen (`index`). */
  listTitle: TTranslationKey;
  /** Header title for the section's create screen (`new`). */
  newTitle: TTranslationKey;
}

/**
 * Stack nested under one of the drawer's sections, so a create form can be
 * pushed as a full screen instead of rendered in a dialog. All three sections
 * have the same two screens, so they share this and pass only their titles.
 *
 * The drawer hides its own header for any section that nests one of these
 * (`AppLayout`), which is what keeps a single header on screen — this stack
 * renders it instead, and the list screen carries the drawer toggle that the
 * drawer header would have provided.
 */
export function SectionStack({ listTitle, newTitle }: ISectionStackProps) {
  const { colors, t } = useSettings();
  const headerOptions = useMemo(() => createHeaderOptions(colors), [colors]);

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name={ESectionScreen.LIST}
        options={{
          title: t(listTitle),
          headerLeft: () => <DrawerToggleButton tintColor={colors.accent} />,
        }}
      />
      <Stack.Screen name={ESectionScreen.NEW} options={{ title: t(newTitle) }} />
    </Stack>
  );
}
