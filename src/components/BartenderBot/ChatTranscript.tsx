import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { TChatMessage, TColorTokens } from '../../types';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';

interface IChatTranscriptProps {
  messages: TChatMessage[];
  isBotTyping: boolean;
  botLabel: string;
  youLabel: string;
  typingLabel: string;
  colors: TColorTokens;
}

export function ChatTranscript({
  messages,
  isBotTyping,
  botLabel,
  youLabel,
  typingLabel,
  colors,
}: IChatTranscriptProps) {
  const listRef = useRef<FlatList<TChatMessage>>(null);

  useEffect(() => {
    // New bubble (or the typing indicator) lands at the bottom — keep it in view.
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, isBotTyping]);

  return (
    <FlatList
      ref={listRef}
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(message) => message.id}
      renderItem={({ item }) => (
        <ChatBubble
          colors={colors}
          message={item}
          senderLabel={item.sender === 'bot' ? botLabel : youLabel}
        />
      )}
      ListFooterComponent={
        isBotTyping ? <TypingIndicator colors={colors} label={typingLabel} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
