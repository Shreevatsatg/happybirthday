import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { getAIResponse } from '@/services/AIService';

const WISH_STYLES = ['Friendly', 'Funny', 'Romantic', 'Formal'];

interface GiftSuggestion {
  id: string;
  name: string;
  description: string;
  url: string;
}

const MOCK_GIFT_SUGGESTIONS: GiftSuggestion[] = [
  {
    id: '1',
    name: 'Smart Watch',
    description: 'Stay connected and track your fitness.',
    url: 'https://www.amazon.com/s?k=smart+watch',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    description: 'Enjoy immersive audio without the wires.',
    url: 'https://www.amazon.com/s?k=wireless+headphones',
  },
  { id: '3', name: 'Novelty Mug', description: 'A fun mug for their morning coffee.', url: 'https://www.amazon.com/s?k=novelty+mug' },
  {
    id: '4',
    name: 'Gourmet Coffee Set',
    description: 'A selection of premium coffee beans.',
    url: 'https://www.amazon.com/s?k=gourmet+coffee+set',
  },
];

type ResultType = 'wish' | 'gifts' | null;

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const [selectedWishStyle, setSelectedWishStyle] = useState(WISH_STYLES[0]);
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [generatedWish, setGeneratedWish] = useState('');
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);

  const handleGenerateWish = async () => {
    setIsLoading(true);
    setResultType('wish');
    setGeneratedWish('');
    const prompt = `Generate a ${selectedWishStyle} birthday wish for someone who likes "${likes}" and dislikes "${dislikes}".`;
    try {
      const responseText = await getAIResponse(prompt);
      setGeneratedWish(responseText);
    } catch (error) {
      setGeneratedWish((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestGift = async () => {
    setIsLoading(true);
    setResultType('gifts');
    setGiftSuggestions([]);
    // In a real app, you'd generate this via AI. For now, we use mock data.
    const prompt = `Suggest birthday gifts for someone who likes "${likes}" and dislikes "${dislikes}".`;
    try {
      // const response = await getAIResponse(prompt);
      // For now, just use mock data after a short delay
      setTimeout(() => {
        setGiftSuggestions(MOCK_GIFT_SUGGESTIONS);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      // Handle error
      setIsLoading(false);
    }
  };

  const handleCopyWish = () => {
    Clipboard.setString(generatedWish);
  };

  const handleShareWish = async () => {
    try {
      await Share.share({ message: generatedWish });
    } catch (error) {
      // Handle error
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />;
    }

    if (resultType === 'wish' && generatedWish) {
      return (
        <View style={[styles.wishCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <ThemedText style={styles.wishText}>{generatedWish}</ThemedText>
          <View style={styles.wishActions}>
            <Pressable onPress={handleCopyWish} style={styles.actionButton}>
              <Ionicons name="copy-outline" size={24} color={colors.icon} />
            </Pressable>
            <Pressable onPress={handleShareWish} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color={colors.icon} />
            </Pressable>
          </View>
        </View>
      );
    }

    if (resultType === 'gifts' && giftSuggestions.length > 0) {
      return (
        <View style={{ marginTop: 20 }}>
          {giftSuggestions.map(gift => (
            <TouchableOpacity
              key={gift.id}
              style={[styles.giftListItem, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => Linking.openURL(gift.url)}
            >
              <View style={styles.giftTextContainer}>
                <ThemedText style={styles.giftName}>{gift.name}</ThemedText>
                <ThemedText style={[styles.giftDescription, { color: colors.textSecondary }]}>
                  {gift.description}
                </ThemedText>
              </View>
              <Ionicons name="open-outline" size={24} color={colors.tint} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Input Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Personalize Your Message
          </ThemedText>
          <ThemedText secondary style={styles.label}>
            Choose a style
          </ThemedText>
          <View style={styles.styleSelector}>
            {WISH_STYLES.map(style => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  {
                    backgroundColor: selectedWishStyle === style ? colors.tint : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedWishStyle(style)}
              >
                <Text style={{ color: selectedWishStyle === style ? colors.card : colors.text }}>
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText secondary style={styles.label}>
            What do they like?
          </ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., hiking, reading, dogs"
            placeholderTextColor={colors.icon}
            value={likes}
            onChangeText={setLikes}
          />
          <ThemedText secondary style={styles.label}>
            What do they dislike?
          </ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., crowds, spicy food"
            placeholderTextColor={colors.icon}
            value={dislikes}
            onChangeText={setDislikes}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionFullButton, { backgroundColor: colors.tint }]}
            onPress={handleGenerateWish}
            disabled={isLoading}
          >
            <ThemedText style={{ color: colors.card, fontWeight: 'bold' }}>
              Generate Wish
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionFullButton, { backgroundColor: colors.tint, marginTop: 12 }]}
            onPress={handleSuggestGift}
            disabled={isLoading}
          >
            <ThemedText style={{ color: colors.card, fontWeight: 'bold' }}>
              Suggest Gift
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        <View style={styles.resultsContainer}>{renderResult()}</View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  styleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  styleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionFullButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  wishCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  wishText: {
    fontSize: 16,
    lineHeight: 24,
  },
  wishActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  giftListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  giftTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
  },
  giftDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});
