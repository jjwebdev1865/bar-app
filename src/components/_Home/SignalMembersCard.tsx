import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatContactDisplayName } from '../../utils/contactFormat';
import type {
  TColorTokens,
  TContact,
  TTranslate,
} from '../../types/common.types';

interface ISignalMembersCardProps {
  contacts: TContact[];
  colors: TColorTokens;
  t: TTranslate;
}

/** Roster of who is heading to the bar while a signal is active. */
export const SignalMembersCard = ({
  contacts,
  colors,
  t,
}: ISignalMembersCardProps) => {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.membersCard}>
      <Text style={styles.membersTitle}>{t('whoIsComing')}</Text>
      <ScrollView
        style={styles.membersList}
        contentContainerStyle={styles.membersListContent}
      >
        {contacts.map((contact, index) => {
          const isLast = index === contacts.length - 1;
          const memberLabel = `${formatContactDisplayName(contact)}: ${t(
            'onTheWay',
          )}`;

          return (
            <View
              key={contact.id}
              accessible
              accessibilityLabel={memberLabel}
              style={[styles.memberRow, !isLast && styles.memberRowDivider]}
            >
              <Text style={styles.memberName} numberOfLines={1}>
                {formatContactDisplayName(contact)}
              </Text>
              <Text style={styles.memberStatus}>{t('onTheWay')}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
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
  });
