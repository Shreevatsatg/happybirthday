import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { getAIResponse } from '@/services/AIService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) {
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await getAIResponse(inputText);
      const aiResponse: Message = {
        id: Date.now().toString() + 'ai',
        text: responseText,
        sender: 'ai',
      };
      setMessages(prevMessages => [aiResponse, ...prevMessages]);
    } catch (error) {
      const errorResponse: Message = {
        id: Date.now().toString() + 'ai',
        text: (error as Error).message,
        sender: 'ai',
      };
      setMessages(prevMessages => [errorResponse, ...prevMessages]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user' ? styles.userMessage : styles.aiMessage,
                  {
                    backgroundColor: item.sender === 'user' ? colors.tint : colors.surface,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: item.sender === 'user' ? colors.card : colors.text,
                  }}
                >
                  {item.text}
                </ThemedText>
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              !isLoading && (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="sparkles-outline" size={64} color={colors.icon} />
                  </View>
                  <ThemedText type="subtitle" style={styles.emptyText}>
                    Ready to Assist!
                  </ThemedText>
                  <ThemedText secondary style={styles.emptySubtext}>
                    Ask for gift ideas, birthday wishes, or party plans.
                  </ThemedText>
                </View>
              )
            )}
            ListFooterComponent={() => (
              isLoading && (
                <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: colors.surface }]}>
                  <ActivityIndicator size="small" color={colors.text} />
                </View>
              )
            )}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Ask for birthday wishes..."
              placeholderTextColor={colors.icon}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed || isLoading ? 0.7 : 1,
                },
              ]}
              disabled={isLoading}
            >
              <Ionicons name="arrow-up" size={24} color={colors.card} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 80, // Add padding to avoid overlap
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
