import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import type { TColorTokens } from '../../types';

export default function BartenderBotScreen() {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
      <Text style={styles.message}>{t('bartenderBotHello')}</Text>
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    message: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.accent,
    },
  });
