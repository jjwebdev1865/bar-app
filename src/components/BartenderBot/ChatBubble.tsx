import { StyleSheet, Text, View } from 'react-native';

import type { TChatMessage, TColorTokens } from '../../types';

interface IChatBubbleProps {
  message: TChatMessage;
  senderLabel: string;
  colors: TColorTokens;
}

export function ChatBubble({ message, senderLabel, colors }: IChatBubbleProps) {
  const styles = createStyles(colors);
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        accessibilityLabel={`${senderLabel}: ${message.text}`}
        style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
      >
        <Text style={isUser ? styles.userText : styles.botText}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    row: {
      width: '100%',
      flexDirection: 'row',
      marginVertical: 4,
    },
    rowUser: {
      justifyContent: 'flex-end',
    },
    bubble: {
      maxWidth: '80%',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    botBubble: {
      borderBottomLeftRadius: 4,
      backgroundColor: colors.panel,
    },
    userBubble: {
      borderBottomRightRadius: 4,
      backgroundColor: colors.accent,
    },
    botText: {
      fontSize: 16,
      color: colors.text,
    },
    userText: {
      fontSize: 16,
      color: colors.onAccent,
    },
  });
